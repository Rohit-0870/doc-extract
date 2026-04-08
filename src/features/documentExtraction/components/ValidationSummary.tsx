import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { ValidationResult } from "@/features/documentExtraction/documentTypes";

interface ValidationSummaryProps {
  validationResults: ValidationResult[];
}

export function ValidationSummary({ validationResults }: ValidationSummaryProps) {
  const validCount = validationResults.filter((v) => v.status === "valid").length;
  const invalidCount = validationResults.filter((v) => v.status === "invalid").length;
  const reviewCount = validationResults.filter((v) => v.requires_human_review).length;

  const formatFieldName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="animate-fade-in rounded-xl bg-card p-6 shadow-card" style={{ animationDelay: "300ms" }}>
      <h2 className="text-lg font-semibold text-foreground">Validation Summary</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Field-by-field validation status
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg bg-success/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{validCount}</p>
            <p className="text-sm text-muted-foreground">Valid Fields</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-destructive/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{invalidCount}</p>
            <p className="text-sm text-muted-foreground">Invalid Fields</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-warning/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{reviewCount}</p>
            <p className="text-sm text-muted-foreground">Need Review</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {validationResults.map((result) => (
          <div
            key={result.field_name}
            className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
          >
            <div className="flex items-center gap-3">
              {result.status === "valid" ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : result.status === "invalid" ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
              <span className="font-medium text-foreground">
                {formatFieldName(result.field_name)}
              </span>
            </div>
            <span className="text-sm capitalize text-muted-foreground">
              {result.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
