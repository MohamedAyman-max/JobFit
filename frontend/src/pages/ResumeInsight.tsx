import { useState, useRef } from "react";
import { FileText, Upload, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AcademicNote } from "@/components/shared/AcademicNote";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type AnalysisResult = {
  target_role: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: { skill: string; importance_pct: number }[];
  cv_skills_found: string[];
};

export default function ResumeInsight() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Data Scientist");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roles = ["Data Scientist", "Data Analyst", "Data Engineer", "Business Analyst", "Software Engineer", "Machine Learning Engineer", "Cloud Engineer"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume file (PDF, DOCX, or TXT)");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_role", targetRole);

    try {
      const response = await fetch(`${API_BASE_URL}/ats/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("API error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simulated rewrite suggestions (can be enhanced with real AI later)
  const getSuggestions = () => {
    if (!result) return [];
    const missingSkills = result.missing_skills.slice(0, 3).map(s => s.skill);
    return [
      {
        original: "Developed applications using various technologies",
        improved: `Engineered scalable solutions using ${missingSkills[0] || "Python"} and ${missingSkills[1] || "SQL"}, improving system performance by 40%`,
      },
      {
        original: "Collaborated with team members on projects",
        improved: "Led cross-functional team of 5 using Agile methodology, delivering 12 successful releases",
      },
      {
        original: "Fixed bugs and improved performance",
        improved: `Resolved critical bugs and optimized application performance, reducing response times by 60% using ${missingSkills[2] || "AWS"}`,
      },
    ];
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="w-5 h-5 text-destructive" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-warning" />;
      default: return <Lightbulb className="w-5 h-5 text-primary" />;
    }
  };

  const getIssueStyle = (type: string) => {
    switch (type) {
      case "error": return "border-l-destructive bg-destructive/5";
      case "warning": return "border-l-warning bg-warning/5";
      default: return "border-l-primary bg-primary/5";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">ATS Resume Analysis</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Optimize Your Resume for <span className="gradient-text">ATS Systems</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your resume (PDF, DOCX, or TXT) to see how well it matches a target job role
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Job Role</label>
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

            <div>
              <label className="block text-sm font-medium mb-2">Upload Resume</label>
              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-grow"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {file ? file.name : "Choose file"}
                </Button>
                <Button
                  variant="hero"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !file}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: PDF, DOCX, TXT
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Score Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-8 flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold mb-4">ATS Compatibility</h3>
                <ScoreRing score={result.match_score} size={140} label="Match Score" />
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Skills Found ({result.matched_skills.length})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto">
                  {result.matched_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Missing Skills ({result.missing_skills.length})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto">
                  {result.missing_skills.slice(0, 10).map((item) => (
                    <span
                      key={item.skill}
                      className="px-2.5 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-xs"
                    >
                      {item.skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Issues based on missing skills */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6">Recommendations</h3>
              <div className="space-y-3">
                {result.missing_skills.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg border-l-4 border-l-warning bg-warning/5">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium">Missing critical skill: {item.skill}</p>
                      <p className="text-sm text-muted-foreground">
                        Appears in {item.importance_pct}% of {result.target_role} job postings.
                      </p>
                    </div>
                  </div>
                ))}
                {result.matched_skills.length === 0 && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border-l-4 border-l-destructive bg-destructive/5">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <p>No matching skills found. Consider adding relevant keywords from the target role.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rewrite Suggestions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Suggested Resume Rewrites
              </h3>
              <div className="space-y-6">
                {getSuggestions().map((suggestion, index) => (
                  <div key={index} className="space-y-3">
                    <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="text-xs text-destructive font-medium mb-1">Original:</div>
                      <p className="text-sm text-muted-foreground">{suggestion.original}</p>
                    </div>
                    <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-success font-medium">Improved:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => copyToClipboard(suggestion.improved, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm">{suggestion.improved}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Note */}
            <AcademicNote>
              ATS analysis uses keyword matching from real job posting data.
            </AcademicNote>
          </div>
        )}
      </div>
    </div>
  );
}