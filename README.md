

```markdown
# JOBFIT – AI Career Guidance Platform

[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)

**JOBFIT** is an intelligent, data-driven career guidance system that helps individuals navigate the rapidly changing labour market. It combines job demand forecasting (LSTM), skill extraction, personalised recommendations (5 modes), and ATS‑aware resume analysis into a unified web application.

 **Live Demo:** [https://jobfitcareer.netlify.app](https://jobfitcareer.netlify.app)  
 **Backend API:** [https://jobtrend-backend.onrender.com/docs](https://jobtrend-backend.onrender.com/docs)

---

##  Table of Contents

- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Dataset](#dataset)
- [Model Performance](#model-performance)
- [Recommendation Modes](#recommendation-modes)
- [Evaluation Results](#evaluation-results)
- [Installation & Setup](#installation--setup)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Usage Examples](#usage-examples)
- [Project Structure](#project-structure)
- [Future Work](#future-work)
- [License](#license)
- [Citation](#citation)

---

## Problem Statement

Modern labour markets are characterised by rapid technological change, skill obsolescence, and automated recruitment systems (ATS). Traditional career guidance platforms rely on static data and retrospective analysis, offering limited support for:

- **Proactive career planning** – anticipating future skill demand.
- **Personalised skill recommendations** – tailored to individual profiles.
- **ATS‑aware resume optimisation** – overcoming keyword‑based screening.

JOBFIT addresses these gaps by integrating labour market analytics, deep learning forecasting, and explainable recommendations into a single, user‑friendly platform.

---

## Key Features

| Feature | Description |
|---------|-------------|
| ** Job Demand Forecasting** | 12‑week, role‑specific demand predictions using LSTM neural networks. |
| ** 5 Recommendation Modes** | Demand‑only, Demand+User, Role Trend, Skill‑to‑Skill, Learning Path. |
| ** ATS Resume Analysis** | Upload CV (PDF/DOCX/TXT) → match score vs target role → missing skills ranked by importance. |
| ** Industry Insights** | Sector‑level trends (Technology, Healthcare, Finance) aggregated from 7 tech roles. |
| ** Interactive Visualisations** | Area charts for demand trends, radar charts for skill gaps, pie/bar charts for market overview. |
| ** Fast & Lightweight** | Pre‑computed CSV files – no TensorFlow at runtime, ready for cloud deployment. |

---

## System Architecture

```
[Raw Job Postings (478k)] → [Notebook: Preprocessing & LSTM Training] → [CSV/NPZ Files]
                                                                               ↓
[React Frontend] ←→ [FastAPI Backend] ←→ [Pre‑computed Data]
       │                      │
       └─ 5 Pages             └─ 8 REST Endpoints
          - Job Future           - /predict
          - Skill Recommend.     - /recommend
          - Resume Insight       - /ats/analyze
          - Industry Insights    - /industry/overview
          - Home                 - /industry/sector/{name}
```

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Data Processing** | Python, Pandas, NumPy, ast.literal_eval |
| **ML / Deep Learning** | TensorFlow, Keras (LSTM), scikit-learn (MinMaxScaler) |
| **Backend API** | FastAPI, Uvicorn, python-multipart |
| **Text Extraction** | PyPDF2, python-docx, RapidFuzz (fuzzy matching) |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Recharts |
| **Build Tools** | Vite, npm |
| **Version Control** | Git, GitHub |
| **Deployment** | Render (backend), Netlify (frontend) |

---

## Dataset

- **Source:** Job Skill Set Dataset (Kaggle / Boatingrevealed.com) – 2024 job postings.
- **Size:** 478,895 rows across 12 monthly sheets (Jan–Dec 2024).
- **Key columns:** `job_title_short` (7 roles), `job_skills` (string list), `job_posted_date`, `job_work_from_home`, etc.
- **Skills completeness:** 85.6% of rows have non‑empty skills (410,025 rows).
- **Roles standardised:** Data Scientist, Data Analyst, Data Engineer, Business Analyst, Software Engineer, ML Engineer, Cloud Engineer.

**Pre‑computed files (generated in notebook):**
- `skills_global.csv` – top 500 skills with global frequency.
- `skills_{Role}.csv` – top 100 skills per role with frequency %.
- `demand_scores.csv` – predicted average daily demand for next 30 days per role.
- `weekly_forecasts.csv` – 12‑week demand index (0–100) per role.
- `cooccurrence.npz` – sparse matrix (300×300) of skill co‑occurrences.

---

## Model Performance

Seven LSTM models were trained (one per role) with the following hyperparameters and test MAPE:

| Role | Lookback | Batch Size | Test MAPE |
|------|----------|------------|-----------|
| Data Scientist | 112 days | 32 | **20.94%** |
| Data Engineer | 112 days | 32 | 22.93% |
| Data Analyst | 14 days | 8 | 23.61% |
| ML Engineer | 112 days | 16 | 25.63% |
| Business Analyst | 14 days | 8 | 27.23% |
| Software Engineer | 112 days | 32 | 28.50% |
| Cloud Engineer | 28 days | 16 | 37.39% |

> MAPE = Mean Absolute Percentage Error. Lower is better. Cloud Engineer had fewer training samples (6,839 postings), explaining higher error.

---

## Recommendation Modes

| Mode | Question Answered | Input | Output |
|------|------------------|-------|--------|
| **Demand‑only** | “What skills are most valuable in the market?” | None | Top skills from highest‑demand roles |
| **Demand + User** | “What skills am I missing from high‑demand roles?” | User skills (comma‑separated) | Missing skills from top roles |
| **Role Trend** | “What skills does a specific role need, adjusted for rising/falling demand?” | User skills + target role | Missing skills weighted by trend factor |
| **Skill‑to‑Skill** | “What skills are commonly learned together with mine?” | User skills | Co‑occurrence‑based adjacent skills |
| **Learning Path** | “What is a structured order to learn skills for a role?” | Target role | Tiered skill list (core → advanced → specialised) |

---

## Evaluation Results

Precision@5 and Recall@5 against ground truth (top 15 skills per role, from frequency data):

| Mode | Precision@5 | Recall@5 |
|------|-------------|----------|
| Demand+User | 0.633 | 0.211 |
| Role Trend | **1.000** | 0.333 |
| Skill‑to‑Skill | 0.767 | 0.256 |
| Learning Path | **1.000** | 0.333 |

- **Trend and Learning Path** achieve perfect precision because they strictly select the most frequent/trending skills.
- **Skill‑to‑Skill** is highly effective for discovering complementary skills.
- **Demand+User** cross‑recommends from high‑demand roles – valuable for career pivots, though precision is lower for a single target role.

---

## Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/your-username/jobtrend.git
cd jobtrend
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment variables** (optional – create `.env` in `backend/`):
```env
# No variables required for local development
```

Run the FastAPI server:
```bash
uvicorn main:app --reload
```
API will be available at `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:8000
```

Run the development server:
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

### 4. Pre‑computed Data (if not already present)
Run the Jupyter notebook `notebooks/jobtrend.ipynb` to generate all CSV/NPZ files in the `data/` directory. This notebook includes:
- Data loading & EDA
- LSTM training (saves models to `models/`)
- Pre‑computation of skill frequencies, co‑occurrence, weekly forecasts, etc.

---

## Usage Examples

### Web Interface

1. **Job Future** – Enter “Data Scientist” → View 12‑week demand trend chart, trend label, automation risk.
2. **Skill Recommendation** – Enter “python, sql, excel” → Choose “Demand + Skills” → Get missing skills: Tableau, Power BI, AWS.
3. **Resume Insight** – Upload a CV, select “Data Engineer” → Get match score (e.g., 65%) and ranked missing skills.
4. **Industry Insights** – Browse Technology, Healthcare, or Finance sectors → See top roles and in‑demand skills.

### API Calls (curl examples)

#### Predict demand for Data Scientist
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"role": "Data Scientist"}'
```

#### Get skill recommendations (Demand+User)
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"mode": "demand_user", "user_skills": ["python", "sql"]}'
```

#### Analyse a CV (save a sample CV as `cv.pdf`)
```bash
curl -X POST http://localhost:8000/ats/analyze \
  -F "file=@cv.pdf" \
  -F "target_role=Data Scientist"
```

---

## Project Structure

```
jobtrend/
├── backend/
│   ├── main.py               # FastAPI application (all endpoints)
│   ├── requirements.txt      # Python dependencies
│   └── start.sh              # (optional) deployment script
├── data/                     # Pre‑computed CSV/NPZ files
│   ├── skills_global.csv
│   ├── skills_Data_Scientist.csv
│   ├── ... (other roles)
│   ├── demand_scores.csv
│   ├── weekly_forecasts.csv
│   ├── cooccurrence.npz
│   ├── skill_list.csv
│   └── daily_demand/
├── models/                   # Trained LSTM models & scalers (backup)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── JobFuture.tsx
│   │   │   ├── SkillRecommendation.tsx
│   │   │   ├── ResumeInsight.tsx
│   │   │   ├── IndustryInsights.tsx
│   │   │   └── Index.tsx
│   │   └── ...
│   ├── .env                  # VITE_API_URL
│   └── package.json
├── notebooks/
│   └── jobtrend.ipynb        # Data preprocessing, LSTM training, pre‑computation
└── README.md
```

---

## Future Work

- **Real‑time data pipeline** – weekly scraping of new job postings, automated model retraining.
- **User authentication & profiles** – save skill history, track progress over time.
- **Course integration** – recommend specific online courses (Coursera, Udemy) for missing skills.
- **Explainability enhancements** – SHAP values for demand forecasts, natural language explanations.
- **Expand beyond tech roles** – include healthcare, finance, retail using additional datasets.

---

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
