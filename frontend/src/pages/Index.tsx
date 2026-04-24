import { Database, Brain, TrendingUp, Target, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { PipelineStep } from "@/components/home/PipelineStep";
import { ModuleCard } from "@/components/home/ModuleCard";
import { Link } from "react-router-dom";

const pipelineSteps = [
  { icon: Database, title: "Job Postings", description: "Collect & process job data" },
  { icon: Brain, title: "Skill Extraction", description: "NLP-based skill parsing" },
  { icon: TrendingUp, title: "Trend Prediction", description: "LSTM demand forecasting" },
  { icon: Target, title: "Career Match", description: "Personalized recommendations" },
  { icon: FileText, title: "Resume Analysis", description: "ATS optimization" },
];

const modules = [
  {
    icon: TrendingUp,
    title: "Job Market Analysis",
    description: "Analyze current job market trends using aggregated data from various sources to understand industry dynamics.",
    href: "/job-future",
  },
  {
    icon: Brain,
    title: "Skill Extraction (NLP)",
    description: "Extract and categorize skills from job descriptions using natural language processing techniques.",
    href: "/skill-recommendation",
  },
  {
    icon: Sparkles,
    title: "Demand Forecasting",
    description: "Predict future job demand using LSTM-based time-series analysis on historical job posting data.",
    href: "/job-future",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description: "Identify gaps between your current skills and job requirements with personalized learning paths.",
    href: "/skill-recommendation",
  },
  {
    icon: FileText,
    title: "ATS Resume Optimizer",
    description: "Analyze and optimize your resume for Applicant Tracking Systems with keyword matching.",
    href: "/resume-insight",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="hero-glow" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Academic Research Project</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up leading-tight">
              <span className="gradient-text">JOBFIT</span>
              <br />
              <span className="text-foreground">Intelligent Career Guidance</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: "100ms" }}>
              An AI-powered system that analyzes job market data, predicts future demand, 
              identifies skill gaps, and provides personalized career and resume guidance.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/job-future">Explore Job Trends</Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/skill-recommendation">Analyze Skills</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-4 -mt-4 mb-16">
        <div className="max-w-3xl mx-auto">
          <DisclaimerBanner />
        </div>
      </section>

      {/* Pipeline Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">System Pipeline</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            How JOBFIT processes and analyzes career data to provide intelligent recommendations
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-4 overflow-x-auto pb-4">
          {pipelineSteps.map((step, index) => (
            <PipelineStep
              key={step.title}
              {...step}
              index={index}
              isLast={index === pipelineSteps.length - 1}
            />
          ))}
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Core Modules</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore each component of the JOBFIT intelligent career guidance system
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((module, index) => (
            <ModuleCard key={module.title} {...module} index={index} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="glass-card p-8 md:p-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">500K+</div>
              <div className="text-sm text-muted-foreground mt-1">Job Postings Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">2,500+</div>
              <div className="text-sm text-muted-foreground mt-1">Unique Skills Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">85%</div>
              <div className="text-sm text-muted-foreground mt-1">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">50+</div>
              <div className="text-sm text-muted-foreground mt-1">Industries Covered</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 text-center mt-6">
          </p>
        </div>
      </section>
    </div>
  );
}
