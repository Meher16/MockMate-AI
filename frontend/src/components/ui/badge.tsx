import { cn } from "@/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" && "bg-primary/15 text-primary",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "success" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        variant === "warning" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        variant === "destructive" && "bg-destructive/15 text-destructive",
        className
      )}
      {...props}
    />
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const variant =
    score >= 80 ? "success" : score >= 60 ? "warning" : "destructive";

  return (
    <Badge variant={variant} className="text-sm px-3 py-1">
      {score}/100
    </Badge>
  );
}
