import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  confidence: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceMeter({ confidence, showLabel = true, size = "md" }: ConfidenceMeterProps) {
  const percentage = Math.round(confidence * 100);
  
  const getColorClass = () => {
    if (percentage >= 90) return "bg-success";
    if (percentage >= 70) return "bg-primary";
    if (percentage >= 50) return "bg-warning";
    return "bg-destructive";
  };

  const sizeClasses = {
    sm: "h-1.5 w-16",
    md: "h-2 w-24",
    lg: "h-2.5 w-32",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-full bg-muted overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColorClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn(
          "font-mono text-muted-foreground",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}>
          {percentage}%
        </span>
      )}
    </div>
  );
}
