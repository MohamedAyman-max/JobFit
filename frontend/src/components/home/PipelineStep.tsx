import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  isLast?: boolean;
}

export function PipelineStep({ icon: Icon, title, description, index, isLast }: PipelineStepProps) {
  return (
    <div className="flex items-center">
      <div
        className={cn(
          "pipeline-step min-w-[180px] animate-fade-in opacity-0",
          `delay-${(index + 1) * 100}`
        )}
        style={{ animationDelay: `${index * 150}ms`, animationFillMode: "forwards" }}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
      </div>
      {!isLast && (
        <div className="pipeline-connector mx-2">
          <ChevronRight className="w-6 h-6 text-primary/50" />
        </div>
      )}
    </div>
  );
}
