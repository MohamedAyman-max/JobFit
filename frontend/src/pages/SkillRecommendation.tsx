import { useState, useEffect } from "react";
import { Target, Sparkles, BookOpen, ExternalLink, TrendingUp, BarChart3, Lightbulb, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AcademicNote } from "@/components/shared/AcademicNote";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type Recommendation = {
  skill: string;
  source_role?: string;
  frequency_pct?: number;
  demand_score?: number;
  weighted_score?: number;
  cooccurrence_score?: number;
  [key: string]: any;
};

type LearningPath = {
  "Tier 1": string[];
  "Tier 2": string[];
  "Tier 3": string[];
};

export default function SkillRecommendation() {
  const [userSkills, setUserSkills] = useState("");
  const [targetRole, setTargetRole] = useState("Data Scientist");
  const [mode, setMode] = useState<"demand_only" | "demand_user" | "trend" | "skill_to_skill" | "learning_path">("demand_user");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalSkills, setGlobalSkills] = useState<string[]>([]);

  // Fetch global skills for autocomplete (optional)
  useEffect(() => {
    fetch(`${API_BASE_URL}/skills/global?limit=100`)
      .then(res => res.json())
      .then(data => {
        if (data.skills) setGlobalSkills(data.skills.map((s: any) => s.skill));
      })
      .catch(console.error);
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setRecommendations([]);
    setLearningPath(null);

    // Parse user skills
    const skillsList = userSkills.split(/[,\n]/).map(s => s.trim().toLowerCase()).filter(Boolean);

    let payload: any = {
      mode: mode,
      user_skills: skillsList,
      top_k_roles: 3,
      top_skills_per_role: 5,
      top_k: 5,
      tiers: [5, 10, 20],
    };

    if (mode === "trend" || mode === "learning_path") {
      if (!targetRole) {
        setError("Please select a target role for this mode");
        setIsAnalyzing(false);
        return;
      }
      payload.target_role = targetRole;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Recommendation failed");
      }

      const data = await response.json();

      if (mode === "learning_path") {
        setLearningPath(data.recommendations);
      } else {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error("API error:", err);
      setError(err instanceof Error ? err.message : "Failed to get recommendations");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const roles = ["Data Scientist", "Data Analyst", "Data Engineer", "Business Analyst", "Software Engineer", "Machine Learning Engineer", "Cloud Engineer"];

  const getModeDescription = () => {
    switch (mode) {
      case "demand_only": return "Top skills from roles with highest predicted demand (next 30 days)";
      case "demand_user": return "Skills you're missing from high‑demand roles, based on your current skills";
      case "trend": return "Role‑specific skills weighted by demand trend (rising/falling)";
      case "skill_to_skill": return "Skills that often appear together with your current skills (co‑occurrence)";
      case "learning_path": return "Tiered learning path: core → advanced → specialised skills for a target role";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Skill Gap Analysis</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Personalized <span className="gradient-text">Skill Recommendations</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Analyze your skills against real job market data and get AI‑powered recommendations
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Current Skills</label>
              <Textarea
                placeholder="Enter your skills, separated by commas or new lines (e.g., Python, SQL, Excel, Tableau)"
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
                className="min-h-[100px] bg-background/50 border-border/50 input-glow"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate multiple skills with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recommendation Mode</label>
              <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                <TabsList className="grid grid-cols-5 h-auto gap-1 bg-muted/50 p-1">
                  <TabsTrigger value="demand_only" className="text-xs">Demand Only</TabsTrigger>
                  <TabsTrigger value="demand_user" className="text-xs">Demand + Skills</TabsTrigger>
                  <TabsTrigger value="trend" className="text-xs">Role Trend</TabsTrigger>
                  <TabsTrigger value="skill_to_skill" className="text-xs">Next Skills</TabsTrigger>
                  <TabsTrigger value="learning_path" className="text-xs">Learning Path</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground mt-2">{getModeDescription()}</p>
            </div>

            {(mode === "trend" || mode === "learning_path") && (
              <div>
                <label className="block text-sm font-medium mb-2">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-2 rounded-md border border-border bg-background"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            )}

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!userSkills.trim() && mode !== "demand_only")}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {recommendations.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {mode === "demand_only" && <TrendingUp className="w-5 h-5 text-primary" />}
                {mode === "demand_user" && <Target className="w-5 h-5 text-primary" />}
                {mode === "trend" && <BarChart3 className="w-5 h-5 text-primary" />}
                {mode === "skill_to_skill" && <Lightbulb className="w-5 h-5 text-primary" />}
                Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <div className="font-medium">{rec.skill}</div>
                      {rec.source_role && (
                        <div className="text-xs text-muted-foreground">from {rec.source_role}</div>
                      )}
                    </div>
                    <div className="text-right">
                      {rec.frequency_pct && (
                        <div className="text-sm font-medium text-primary">{rec.frequency_pct.toFixed(1)}% frequency</div>
                      )}
                      {rec.demand_score && (
                        <div className="text-xs text-muted-foreground">demand score: {rec.demand_score.toFixed(0)}</div>
                      )}
                      {rec.weighted_score && (
                        <div className="text-xs text-muted-foreground">weighted: {rec.weighted_score.toFixed(1)}</div>
                      )}
                      {rec.cooccurrence_score && (
                        <div className="text-xs text-muted-foreground">co‑occurrence: {rec.cooccurrence_score}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AcademicNote>
              Recommendations are generated from real job posting data (478k+ postings) using skill frequency analysis and LSTM demand forecasting.
            </AcademicNote>
          </div>
        )}

        {/* Learning Path Results */}
        {learningPath && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Learning Path for {targetRole}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-primary mb-2">Tier 1 – Core Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {learningPath["Tier 1"]?.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-primary mb-2">Tier 2 – Advanced Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {learningPath["Tier 2"]?.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-primary/10 text-foreground rounded-full text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-primary mb-2">Tier 3 – Specialised Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {learningPath["Tier 3"]?.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <AcademicNote>
              Learning paths are built from skill frequency data: core skills appear in most postings, specialised skills in fewer.
            </AcademicNote>
          </div>
        )}
      </div>
    </div>
  );
}