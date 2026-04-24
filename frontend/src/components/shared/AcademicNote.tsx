import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface AcademicNoteProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function AcademicNote({ title = "Academic Context", children, className }: AcademicNoteProps) {
  return (
    <div className={cn("glass-card p-4 border-l-4 border-l-primary", className)}>
      <div className="flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}
