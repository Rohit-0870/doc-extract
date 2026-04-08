import { CheckCircle2, XCircle, AlertTriangle, Clock, Hash, FileText, DollarSign, Cpu } from "lucide-react";
import type { Statistics, TokenUsage, CostInfo } from "@/features/documentExtraction/documentTypes";

interface MetricsCardProps {
  isValid: boolean;
  requiresHumanReview: boolean;
  hitlFields: string[];
  statistics: Statistics;
  tokenUsage: TokenUsage;
  costInfo: CostInfo;
  timeTakenSeconds: number;
  metricsRecordId: number;
  rawTextPreview: string;
  error: string | null;
}

export function MetricsCard({
  isValid,
  requiresHumanReview,
  hitlFields,
  statistics,
  tokenUsage,
  costInfo,
  timeTakenSeconds,
  metricsRecordId,
  rawTextPreview,
  error,
}: MetricsCardProps) {
  return (
    <div className="animate-fade-in rounded-xl bg-card p-6 shadow-card" style={{ animationDelay: "200ms" }}>
      <h2 className="text-lg font-semibold text-foreground">Processing Metrics</h2>

      {/* Statistics Grid */}
      <div className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Elapsed Time</p>
            <p className="text-lg font-bold text-foreground">{timeTakenSeconds.toFixed(2)}s</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Total Fields</p>
            <p className="text-xl font-bold text-foreground">{statistics.total_fields}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Mandatory</p>
            <p className="text-xl font-bold text-foreground">{statistics.mandatory_count}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
            <p className="text-xl font-bold text-foreground">{(statistics.average_confidence * 100).toFixed(0)}%</p>
          </div>
          {/* <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">High Confidence</p>
            <p className="text-xl font-bold text-foreground">{statistics.high_confidence_count}</p>
          </div> */}
        </div>
      </div>

      {/* Token Usage & Cost */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Token Usage</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Input</span>
              <span className="font-mono text-foreground">{tokenUsage.input_tokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Output</span>
              <span className="font-mono text-foreground">{tokenUsage.output_tokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-semibold text-foreground">{tokenUsage.total_tokens.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold text-foreground">Cost Info</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Input Cost</span>
              <span className="font-mono text-foreground">${costInfo.input_cost_usd.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Output Cost</span>
              <span className="font-mono text-foreground">${costInfo.output_cost_usd.toFixed(6)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-semibold text-success">${costInfo.total_cost_usd.toFixed(6)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Hash className="h-3 w-3" />
          <span>Record ID: {metricsRecordId}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
