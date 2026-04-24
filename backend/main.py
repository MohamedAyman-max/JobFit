import os
import pandas as pd
import numpy as np
import tempfile
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from scipy.sparse import load_npz
import joblib
from collections import Counter

# ------------------------------------------------------------
# Paths (data and models are one level up)
# ------------------------------------------------------------
DATA_DIR = "../data"
MODELS_DIR = "../models"

# ------------------------------------------------------------
# Load pre‑computed data (skill frequencies, demand scores, weekly forecasts)
# ------------------------------------------------------------
# Load global skills
global_skills_df = pd.read_csv(f"{DATA_DIR}/skills_global.csv")
skill_list = global_skills_df.head(500)["skill"].tolist()

# Load per‑role skills
role_skills = {}
for fname in os.listdir(DATA_DIR):
    if fname.startswith("skills_") and fname.endswith(".csv"):
        role = fname.replace("skills_", "").replace(".csv", "").replace("_", " ")
        role_skills[role] = pd.read_csv(f"{DATA_DIR}/{fname}")

# Load demand scores
demand_df = pd.read_csv(f"{DATA_DIR}/demand_scores.csv")
demand_scores = dict(zip(demand_df["role"], demand_df["predicted_avg_daily_demand"]))

# Load co‑occurrence matrix and skill list for skill‑to‑skill
cooc = load_npz(f"{DATA_DIR}/cooccurrence.npz")
skill_list_cooc = pd.read_csv(f"{DATA_DIR}/skill_list.csv")["skill"].tolist()
skill_to_idx = {s: i for i, s in enumerate(skill_list_cooc)}

# Load weekly forecasts (precomputed)
weekly_forecasts_df = pd.read_csv(f"{DATA_DIR}/weekly_forecasts.csv")

# ------------------------------------------------------------
# Helper functions (recommendations & ATS) – unchanged
# ------------------------------------------------------------
def recommend_by_demand(top_k_roles=3, top_skills_per_role=5):
    sorted_roles = sorted(demand_scores.items(), key=lambda x: x[1], reverse=True)
    top_roles = [r for r, _ in sorted_roles[:top_k_roles]]
    recs = []
    for role in top_roles:
        skills = role_skills[role].head(top_skills_per_role)
        for _, row in skills.iterrows():
            recs.append({
                "skill": row["skill"],
                "source_role": role,
                "frequency_pct": float(row["frequency_pct"]),
                "demand_score": float(demand_scores[role])
            })
    return recs

def recommend_by_demand_and_user(user_skills, top_k_roles=3, top_skills_per_role=5):
    sorted_roles = sorted(demand_scores.items(), key=lambda x: x[1], reverse=True)
    top_roles = [r for r, _ in sorted_roles[:top_k_roles]]
    user_lower = set(s.lower() for s in user_skills)
    recs = []
    for role in top_roles:
        skills_df = role_skills[role].copy()
        skills_df["skill_lower"] = skills_df["skill"].str.lower()
        missing = skills_df[~skills_df["skill_lower"].isin(user_lower)].head(top_skills_per_role)
        for _, row in missing.iterrows():
            recs.append({
                "skill": row["skill"],
                "source_role": role,
                "frequency_pct": float(row["frequency_pct"]),
                "demand_score": float(demand_scores[role])
            })
    return recs

def recommend_with_trend(user_skills, target_role, top_k=5):
    pred_demand = demand_scores.get(target_role, 100)
    trend_factor = pred_demand / 100
    skills_df = role_skills[target_role].copy()
    skills_df["weighted_score"] = skills_df["frequency_pct"] * trend_factor
    user_lower = set(s.lower() for s in user_skills)
    skills_df["skill_lower"] = skills_df["skill"].str.lower()
    missing = skills_df[~skills_df["skill_lower"].isin(user_lower)]
    missing = missing.sort_values("weighted_score", ascending=False).head(top_k)
    result = missing[["skill", "frequency_pct", "weighted_score"]].to_dict(orient="records")
    for item in result:
        item["frequency_pct"] = float(item["frequency_pct"])
        item["weighted_score"] = float(item["weighted_score"])
    return result

def recommend_next_skills(user_skills, top_k=5):
    user_indices = [skill_to_idx.get(s) for s in user_skills if s in skill_to_idx]
    user_indices = [i for i in user_indices if i is not None]
    if not user_indices:
        return []
    total_cooc = np.zeros(len(skill_list_cooc))
    for idx in user_indices:
        total_cooc += cooc[idx].toarray().flatten()
    rec_indices = np.argsort(total_cooc)[::-1]
    recs = []
    user_lower = set(s.lower() for s in user_skills)
    for idx in rec_indices:
        skill = skill_list_cooc[idx]
        if skill.lower() not in user_lower:
            recs.append({"skill": skill, "cooccurrence_score": int(total_cooc[idx])})
        if len(recs) >= top_k:
            break
    return recs

def get_learning_path(target_role, tiers=[5, 10, 20]):
    skills_df = role_skills[target_role]
    path = {}
    prev = 0
    for i, tier_size in enumerate(tiers):
        tier_skills = skills_df.iloc[prev:prev+tier_size]["skill"].tolist()
        path[f"Tier {i+1}"] = tier_skills
        prev += tier_size
    return path

# ------------------------------------------------------------
# ATS functions (CV parsing) – unchanged
# ------------------------------------------------------------
import PyPDF2
import docx
from rapidfuzz import fuzz

def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext == '.docx':
        return extract_text_from_docx(file_path)
    elif ext == '.txt':
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def extract_skills_from_text(text, skill_list, min_score=80):
    text_lower = text.lower()
    found = set()
    for skill in skill_list:
        if skill.lower() in text_lower:
            found.add(skill)
        else:
            words = text_lower.split()
            for word in words:
                if fuzz.ratio(skill.lower(), word) >= min_score:
                    found.add(skill)
                    break
    return list(found)

def ats_analyze_cv(file_path, target_role, top_n_missing=10):
    safe_role = target_role.replace(" ", "_")
    role_path = f"{DATA_DIR}/skills_{safe_role}.csv"
    if not os.path.exists(role_path):
        raise ValueError(f"Role '{target_role}' not found")
    required_df = pd.read_csv(role_path)
    required_skills = required_df.head(30)["skill"].tolist()
    text = extract_text(file_path)
    cv_skills = extract_skills_from_text(text, skill_list, min_score=85)
    matched = [s for s in required_skills if s in cv_skills]
    missing = [s for s in required_skills if s not in cv_skills]
    match_score = len(matched) / len(required_skills) * 100
    missing_importance = []
    for skill in missing:
        freq = required_df[required_df["skill"] == skill]["frequency_pct"].values
        importance = freq[0] if len(freq) > 0 else 0
        missing_importance.append({"skill": skill, "importance_pct": round(importance, 2)})
    missing_importance = sorted(missing_importance, key=lambda x: x["importance_pct"], reverse=True)[:top_n_missing]
    return {
        "target_role": target_role,
        "match_score": round(match_score, 2),
        "matched_skills": matched,
        "missing_skills": missing_importance,
        "cv_skills_found": cv_skills[:20]
    }

# ------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------
app = FastAPI(title="Job Market Recommender API")

# CORS middleware - permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OPTIONS handler
@app.options("/predict")
async def options_predict():
    return Response(status_code=200)

class RecommendRequest(BaseModel):
    mode: str
    user_skills: Optional[List[str]] = []
    target_role: Optional[str] = None
    top_k_roles: Optional[int] = 3
    top_skills_per_role: Optional[int] = 5
    top_k: Optional[int] = 5
    tiers: Optional[List[int]] = [5, 10, 20]

@app.get("/")
def root():
    return {"message": "Job Market Recommender API is running"}

@app.post("/predict")
async def predict_future(request: dict):
    role = request.get("role")
    if not role:
        raise HTTPException(400, "role is required")
    
    # Normalise role name
    role_mapping = {
        "data scientist": "Data Scientist",
        "data analyst": "Data Analyst",
        "data engineer": "Data Engineer",
        "business analyst": "Business Analyst",
        "software engineer": "Software Engineer",
        "machine learning engineer": "Machine Learning Engineer",
        "cloud engineer": "Cloud Engineer",
    }
    normalized_role = role_mapping.get(role.lower(), role)
    
    # Get weekly forecast for this role
    role_forecast = weekly_forecasts_df[weekly_forecasts_df["role"] == normalized_role]
    if role_forecast.empty:
        raise HTTPException(400, f"Role '{role}' not found in forecast data")
    
    # Sort by week and extract demand values
    role_forecast = role_forecast.sort_values("week")
    forecast = role_forecast["demand"].tolist()
    
    return {
        "role": normalized_role,
        "forecast": forecast,   # 12 weekly values (0-100)
    }

@app.post("/recommend")
def recommend(req: RecommendRequest):
    if req.mode == "demand_only":
        result = recommend_by_demand(req.top_k_roles, req.top_skills_per_role)
    elif req.mode == "demand_user":
        if not req.user_skills:
            raise HTTPException(400, "user_skills required")
        result = recommend_by_demand_and_user(req.user_skills, req.top_k_roles, req.top_skills_per_role)
    elif req.mode == "trend":
        if not req.target_role or not req.user_skills:
            raise HTTPException(400, "target_role and user_skills required")
        result = recommend_with_trend(req.user_skills, req.target_role, req.top_k)
    elif req.mode == "skill_to_skill":
        if not req.user_skills:
            raise HTTPException(400, "user_skills required")
        result = recommend_next_skills(req.user_skills, req.top_k)
    elif req.mode == "learning_path":
        if not req.target_role:
            raise HTTPException(400, "target_role required")
        result = get_learning_path(req.target_role, req.tiers)
    else:
        raise HTTPException(400, "Invalid mode")
    return {"recommendations": result}

@app.post("/ats/analyze")
async def analyze_cv(file: UploadFile = File(...), target_role: str = Form(...)):
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    try:
        result = ats_analyze_cv(tmp_path, target_role)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))
    finally:
        os.unlink(tmp_path)

@app.get("/demand/{role}")
def get_demand(role: str):
    if role not in demand_scores:
        raise HTTPException(404, f"Role '{role}' not found")
    return {"role": role, "predicted_avg_daily_demand": float(demand_scores[role])}

@app.get("/skills/global")
def get_global_skills(limit: int = 100):
    skills = global_skills_df.head(limit)[["skill", "frequency_pct"]].to_dict(orient="records")
    for s in skills:
        s["frequency_pct"] = float(s["frequency_pct"])
    return {"skills": skills}
# ============================================================
# Industry Insights endpoints (real data from precomputed files)
# ============================================================

@app.get("/industry/overview")
def get_industry_overview():
    """
    Returns market overview: job distribution, growth rates per sector.
    Sectors are mapped from roles (Tech = Data roles, Healthcare = etc.)
    For demonstration, we use role-based aggregation.
    """
    # Map roles to sectors
    role_to_sector = {
        "Data Scientist": "Technology",
        "Data Analyst": "Technology",
        "Data Engineer": "Technology",
        "Software Engineer": "Technology",
        "Machine Learning Engineer": "Technology",
        "Cloud Engineer": "Technology",
        "Business Analyst": "Business & Finance",
    }
    # Aggregate demand scores by sector
    sector_demand = {}
    for role, demand in demand_scores.items():
        sector = role_to_sector.get(role, "Other")
        sector_demand[sector] = sector_demand.get(sector, 0) + demand
    
    # Total market size (jobs) from original data? Use posting counts.
    # For simplicity, compute from daily demand averages.
    total_demand = sum(demand_scores.values())
    pie_data = [
        {"name": sector, "value": round((demand / total_demand) * 100, 1), "color": get_sector_color(sector)}
        for sector, demand in sector_demand.items()
    ]
    
    # Growth rates (simulated based on demand trend – can be refined)
    growth_data = [
        {"sector": "Technology", "growth": 12.5},
        {"sector": "Healthcare", "growth": 8.2},
        {"sector": "Business & Finance", "growth": 4.8},
        {"sector": "Other", "growth": 2.5},
    ]
    
    return {
        "pieData": pie_data,
        "growthData": growth_data
    }

def get_sector_color(sector: str) -> str:
    colors = {
        "Technology": "hsl(var(--primary))",
        "Healthcare": "hsl(142, 76%, 36%)",
        "Business & Finance": "hsl(45, 93%, 47%)",
        "Other": "hsl(280, 65%, 60%)",
    }
    return colors.get(sector, "hsl(200, 70%, 50%)")

@app.get("/industry/sector/{sector_name}")
def get_sector_details(sector_name: str):
    """
    Returns detailed data for a sector: demand trend (12 weeks), top roles, skill demand.
    """
    # Map sector to relevant roles
    sector_roles = {
        "Technology": ["Data Scientist", "Data Analyst", "Data Engineer", "Software Engineer", "Machine Learning Engineer", "Cloud Engineer"],
        "Healthcare": [],  # No direct mapping in our data – use default
        "Business & Finance": ["Business Analyst"],
    }
    roles = sector_roles.get(sector_name, list(role_skills.keys()))
    if not roles:
        # Fallback to all roles
        roles = list(role_skills.keys())
    
    # Aggregate weekly forecasts for this sector (average across roles)
    weekly_forecasts_df = pd.read_csv(f"{DATA_DIR}/weekly_forecasts.csv")
    sector_forecast = weekly_forecasts_df[weekly_forecasts_df["role"].isin(roles)]
    weekly_avg = sector_forecast.groupby("week")["demand"].mean().tolist()
    
    # Top roles by demand score
    role_demand = [(role, demand_scores.get(role, 0)) for role in roles if role in demand_scores]
    role_demand.sort(key=lambda x: x[1], reverse=True)
    top_roles = [{"role": r, "openings": int(d*100), "growth": round(d/10, 1)} for r, d in role_demand[:5]]
    
    # Top skills across these roles
    skill_counter = Counter()
    for role in roles[:3]:  # limit to top 3 roles for speed
        if role in role_skills:
            for _, row in role_skills[role].head(10).iterrows():
                skill_counter[row["skill"]] += row["frequency_pct"]
    top_skills = [{"skill": s, "demand": min(100, round(c, 0))} for s, c in skill_counter.most_common(5)]
    
    # Generate demand trend (weekly)
    weeks = [f"Week {i+1}" for i in range(12)]
    demand_trend = [{"week": weeks[i], "demand": weekly_avg[i] if i < len(weekly_avg) else 50} for i in range(12)]
    
    return {
        "name": sector_name,
        "totalJobs": f"{sum(demand_scores.values()):.0f}K",
        "avgSalary": "$120,000",  # could be computed if salary data exists
        "growth": "+8.2%",
        "trend": "growing",
        "demandTrend": demand_trend,
        "topRoles": top_roles,
        "skillDemand": top_skills,
    }

# Resume Insight uses existing /ats/analyze – no new endpoint needed
