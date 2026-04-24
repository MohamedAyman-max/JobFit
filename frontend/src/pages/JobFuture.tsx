import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Search, Zap, Building2, Bot, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AcademicNote } from "@/components/shared/AcademicNote";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { cn } from "@/lib/utils";

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type JobResult = {
  trend: "growing" | "stable" | "declining";
  demandLevel: string;
  industryRelevance: string;
  automationRisk: "low" | "medium" | "high";
  chartData: { week: string; demand: number }[];
  insights: string[];
};

// Helper to determine trend from forecasted demand values (12 weeks)
const determineTrend = (chartData: { week: string; demand: number }[]): "growing" | "stable" | "declining" => {
  if (chartData.length < 2) return "stable";
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.demand, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.demand, 0) / secondHalf.length;
  const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
  if (percentChange > 5) return "growing";
  if (percentChange < -5) return "declining";
  return "stable";
};

// Helper to determine demand level from latest demand value
const getDemandLevel = (latestDemand: number): string => {
  if (latestDemand >= 80) return "Very High";
  if (latestDemand >= 60) return "High";
  if (latestDemand >= 40) return "Moderate";
  if (latestDemand >= 20) return "Low";
  return "Very Low";
};

// Helper to determine automation risk based on trend and role type
const getAutomationRisk = (trend: string, role: string): "low" | "medium" | "high" => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes("data") || roleLower.includes("scientist") || 
      roleLower.includes("engineer") || roleLower.includes("analyst") ||
      roleLower.includes("developer") || roleLower.includes("architect")) {
    return "low";
  }
  if (trend === "declining") return "high";
  if (trend === "stable") return "medium";
  return "low";
};

// Helper to generate insights based on forecast and role
const generateInsights = (role: string, trend: string): string[] => {
  const insights = [];
  const roleLower = role.toLowerCase();
  
  if (trend === "growing") {
    insights.push(`Demand for ${role} is projected to grow over the next 3 months`);
  } else if (trend === "declining") {
    insights.push(`Demand for ${role} shows a declining trend – consider upskilling`);
  } else {
    insights.push(`Demand for ${role} is projected to remain stable`);
  }
  
  // Role-specific insights
  if (roleLower.includes("data")) {
    insights.push("Cloud computing and AI/ML skills are increasingly valuable");
    insights.push("Python and SQL remain the most in-demand skills");
  } else if (roleLower.includes("software")) {
    insights.push("DevOps and cloud experience strongly recommended");
    insights.push("Full-stack capabilities are highly valued");
  } else if (roleLower.includes("business")) {
    insights.push("Data visualization and storytelling skills are crucial");
    insights.push("Domain expertise combined with analytics is a differentiator");
  } else {
    insights.push("Continuous learning and certification recommended");
    insights.push("Consider specializing in emerging technologies");
  }
  
  return insights;
};

export default function JobFuture() {
  const [jobTitle, setJobTitle] = useState("");
  const [result, setResult] = useState<JobResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobTitle.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: jobTitle.trim(), forecast_days: 84 }), // 12 weeks
      });
      
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      
      // Create weekly labels: Week 1, Week 2, ..., Week 12
      const weeks = Array.from({ length: 12 }, (_, i) => `Week ${i+1}`);
      const chartData = data.forecast.map((demand: number, idx: number) => ({
        week: weeks[idx],
        demand: Math.min(100, Math.max(0, demand)),
      }));
      
      const trend = determineTrend(chartData);
      const latestDemand = chartData[chartData.length - 1]?.demand || 50;
      const demandLevel = getDemandLevel(latestDemand);
      const automationRisk = getAutomationRisk(trend, jobTitle);
      const insights = generateInsights(jobTitle, trend);
      
      setResult({
        trend,
        demandLevel,
        industryRelevance: "Tech, Finance, Healthcare, Corporate",
        automationRisk,
        chartData,
        insights,
      });
      
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to get forecast. Please check if the backend server is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "growing": return <TrendingUp className="w-5 h-5 text-success" />;
      case "declining": return <TrendingDown className="w-5 h-5 text-destructive" />;
      default: return <Minus className="w-5 h-5 text-warning" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "growing": return "text-success";
      case "declining": return "text-destructive";
      default: return "text-warning";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-success/20 text-success";
      case "high": return "bg-destructive/20 text-destructive";
      default: return "bg-warning/20 text-warning";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Job Future Explorer</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Predict Future <span className="gradient-text">Job Demand</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter a job title to see demand predictions for the next 3 months (weekly forecast)
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="glass-card p-6">
            <div className="flex gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter job title (e.g., Data Scientist, Data Analyst)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="pl-10 h-12 bg-background/50 border-border/50 input-glow"
                />
              </div>
              <Button
                variant="hero"
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobTitle.trim()}
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Analyzing
                  </span>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Try: "Data Scientist", "Data Analyst", "Data Engineer", "Business Analyst"
            </p>
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  {getTrendIcon(result.trend)}
                  <span className="text-sm text-muted-foreground">Trend</span>
                </div>
                <div className={cn("text-xl font-bold capitalize", getTrendColor(result.trend))}>
                  {result.trend}
                </div>
              </div>
              
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Demand Level</span>
                </div>
                <div className="text-xl font-bold">{result.demandLevel}</div>
              </div>
              
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Industries</span>
                </div>
                <div className="text-sm font-medium">{result.industryRelevance}</div>
              </div>
              
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Automation Risk</span>
                </div>
                <div className={cn("inline-block px-3 py-1 rounded-full text-sm font-medium capitalize", getRiskColor(result.automationRisk))}>
                  {result.automationRisk}
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6">Projected Demand Trend (12-Week Forecast)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData}>
                    <defs>
                      <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[0, 100]}
                      label={{ value: "Demand Index", angle: -90, position: "insideLeft", style: { fontSize: "12px" } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="demand"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#demandGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Key Insights
              </h3>
              <ul className="space-y-3">
                {result.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <AcademicNote>
              Predictions are generated using LSTM time-series forecasting trained on 2024 job posting data.
              Forecasts are updated weekly and show 3-month forward demand.
            </AcademicNote>
          </div>
        )}
      </div>
    </div>
  );
}