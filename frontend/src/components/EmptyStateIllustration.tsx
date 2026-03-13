import { Search, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateIllustrationProps {
  variant: "search" | "notFound";
  className?: string;
}

export function EmptyStateIllustration({ variant, className }: EmptyStateIllustrationProps) {
  const Icon = variant === "search" ? Search : FileQuestion;

  return (
    <div className={cn("w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto", className)}>
      <Icon className="w-10 h-10 text-primary" />
    </div>
  );
}
