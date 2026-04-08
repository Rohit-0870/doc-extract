import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: "valid" | "invalid" | "warning" | "pending";
  label?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const config = {
    valid: {
      icon: CheckCircle2,
      className: "bg-success/10 text-success border-success/20",
      defaultLabel: "Valid",
    },
    invalid: {
      icon: XCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20",
      defaultLabel: "Invalid",
    },
    warning: {
      icon: AlertCircle,
      className: "bg-warning/10 text-warning border-warning/20",
      defaultLabel: "Warning",
    },
    pending: {
      icon: Clock,
      className: "bg-muted text-muted-foreground border-border",
      defaultLabel: "Pending",
    },
  };

  const { icon: Icon, className, defaultLabel } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {label || defaultLabel}
    </span>
  );
}
