import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import Index from "./pages/Index";
import JobFuture from "./pages/JobFuture";
import SkillRecommendation from "./pages/SkillRecommendation";
import ResumeInsight from "./pages/ResumeInsight";
import IndustryInsights from "./pages/IndustryInsights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/job-future" element={<JobFuture />} />
              <Route path="/skill-recommendation" element={<SkillRecommendation />} />
              <Route path="/resume-insight" element={<ResumeInsight />} />
              <Route path="/industry-insights" element={<IndustryInsights />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
