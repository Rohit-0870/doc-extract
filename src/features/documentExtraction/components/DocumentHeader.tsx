import { FileText, Clock, HardDrive, CheckCircle2, AlertTriangle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import type { DocumentExtractionResponse } from "@/features/documentExtraction/documentTypes";

interface DocumentHeaderProps {
  data: DocumentExtractionResponse;
}

export function DocumentHeader({ data }: DocumentHeaderProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  return (
    <div className="animate-fade-in rounded-xl bg-card p-6 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{data.filename}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5" />
                {formatFileSize(data.file_size_bytes)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(data.time_taken_seconds)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge
            status={data.is_valid ? "valid" : "invalid"}
            label={data.is_valid ? "Valid" : "Invalid"}
          />
          {data.requires_human_review && (
            <StatusBadge status="warning" label="Review Needed" />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Document Type
          </p>
          <p className="mt-1 text-lg font-semibold capitalize text-foreground">
            {data.document_type}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Classification Confidence
          </p>
          <div className="mt-2">
            <ConfidenceMeter confidence={data.classification.confidence} size="lg" />
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Key Indicators
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.classification.key_indicators.map((indicator) => (
              <span
                key={indicator}
                className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
              >
                {indicator}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
