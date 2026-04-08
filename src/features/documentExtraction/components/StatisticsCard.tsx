import { BarChart3, Layers, Target, Zap } from "lucide-react";
import type { Statistics, TokenUsage, CostInfo } from "@/features/documentExtraction/documentTypes";

interface StatisticsCardProps {
  statistics: Statistics;
  tokenUsage: TokenUsage;
  costInfo: CostInfo;
}

export function StatisticsCard({ statistics, tokenUsage, costInfo }: StatisticsCardProps) {
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(6)}`;
  };

  return (
    <div className="animate-fade-in rounded-xl bg-card p-6 shadow-card" style={{ animationDelay: "400ms" }}>
      <h2 className="text-lg font-semibold text-foreground">Processing Statistics</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Extraction metrics and usage information
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{statistics.total_fields}</p>
            <p className="text-xs text-muted-foreground">Total Fields</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <Target className="h-5 w-5 text-info" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(statistics.average_confidence * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Zap className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {tokenUsage.total_tokens.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Tokens</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <BarChart3 className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatCost(costInfo.total_cost_usd)}
            </p>
            <p className="text-xs text-muted-foreground">Processing Cost</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-foreground">Field Type Distribution</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(statistics.field_type_distribution).map(([type, count]) => (
            <div
              key={type}
              className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
            >
              <span className="text-sm font-medium capitalize text-foreground">{type}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
