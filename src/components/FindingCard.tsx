// src/components/FindingCard.tsx
"use client";

import { ToolFinding } from "@/types";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, CheckCircle, AlertCircle } from "lucide-react";

const TOOL_LABELS: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

interface FindingCardProps {
  finding: ToolFinding;
}

export function FindingCard({ finding }: FindingCardProps) {
  const {
    tool,
    currentPlan,
    currentSpend,
    recommendation,
    recommendedPlan,
    estimatedSpend,
    monthlySavings,
    reason,
  } = finding;

  const hasSavings = monthlySavings > 0;
  const isOptimal = !hasSavings;

  return (
    <div className={`rounded-xl border p-5 space-y-3 ${
      hasSavings
        ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
        : "border-border bg-card"
    }`}>

      {/* Tool name + status badge */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-base">{TOOL_LABELS[tool] ?? tool}</h3>
        {hasSavings ? (
          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-100 dark:text-amber-400">
            <TrendingDown size={12} className="mr-1" />
            Save ${monthlySavings.toFixed(0)}/mo
          </Badge>
        ) : (
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-100 dark:text-green-400">
            <CheckCircle size={12} className="mr-1" />
            Optimal
          </Badge>
        )}
      </div>

      {/* Spend comparison */}
      <div className="flex items-center gap-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Current</p>
          <p className="font-medium">${currentSpend}/mo</p>
          <p className="text-xs text-muted-foreground">{currentPlan}</p>
        </div>

        {hasSavings && (
          <>
            <div className="text-muted-foreground">→</div>
            <div>
              <p className="text-muted-foreground text-xs">Recommended</p>
              <p className="font-medium text-green-700 dark:text-green-400">
                ${estimatedSpend}/mo
              </p>
              <p className="text-xs text-muted-foreground">{recommendedPlan}</p>
            </div>
          </>
        )}
      </div>

      {/* Recommendation */}
      <div className="space-y-1">
        <p className="text-sm font-medium flex items-center gap-1.5">
          {hasSavings
            ? <AlertCircle size={14} className="text-amber-600 shrink-0" />
            : <CheckCircle size={14} className="text-green-600 shrink-0" />
          }
          {recommendation}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed pl-5">
          {reason}
        </p>
      </div>
    </div>
  );
}