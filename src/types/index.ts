// src/types/index.ts

export type ToolName =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolEntry {
  tool: ToolName;
  plan: string;
  seats: number;
  monthlySpend: number; // what they're actually paying
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  primaryUseCase: UseCase;
}

export interface ToolFinding {
  tool: ToolName;
  currentPlan: string;
  currentSpend: number;
  recommendation: string;
  recommendedPlan: string;
  estimatedSpend: number;
  monthlySavings: number;
  reason: string; // the 1-sentence defensible reason
}

export interface AuditResult {
  findings: ToolFinding[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isAlreadyOptimal: boolean;
  summaryText?: string; // filled in by Anthropic API
  shareId?: string;     // UUID for the public URL
}