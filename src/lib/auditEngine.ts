// src/lib/auditEngine.ts
// Pure function: AuditInput → AuditResult
// No API calls. No side effects. Fully testable.

import { AuditInput, AuditResult, ToolEntry, ToolFinding, ToolName } from "@/types";

// ---------------------------------------------------------------------------
// Pricing constants (sourced in PRICING_DATA.md)
// ---------------------------------------------------------------------------

const PRICES: Record<string, Record<string, number>> = {
  cursor: {
    hobby: 0, pro: 20, pro_plus: 60, ultra: 200, business: 40,
  },
  github_copilot: {
    free: 0, pro: 10, pro_plus: 39, business: 19, enterprise: 39,
  },
  claude: {
    free: 0, pro: 20, max_5x: 100, max_20x: 200,
    team_standard: 25, team_premium: 125,
  },
  chatgpt: {
    free: 0, plus: 20, pro: 200, business: 25,
  },
  gemini: {
    free: 0, ai_pro: 19.99, ai_ultra: 249.99,
  },
  windsurf: {
    free: 0, pro: 15, teams: 30,
  },
  anthropic_api: { direct: 0 },
  openai_api:    { direct: 0 },
};

// Per-seat price for a given tool + plan. Returns 0 for free/API tiers.
function pricePerSeat(tool: ToolName, plan: string): number {
  return PRICES[tool]?.[plan] ?? 0;
}

// Expected monthly cost based on plan × seats
function expectedCost(tool: ToolName, plan: string, seats: number): number {
  const perSeat = pricePerSeat(tool, plan);
  // Individual plans (Claude Pro, ChatGPT Plus, Gemini AI Pro) are flat,
  // not per-seat. Cap them at 1 × price regardless of seats entered.
  const individualPlans = new Set([
    "claude:pro", "claude:max_5x", "claude:max_20x",
    "chatgpt:plus", "chatgpt:pro",
    "gemini:ai_pro", "gemini:ai_ultra",
    "cursor:pro", "cursor:pro_plus", "cursor:ultra",
    "github_copilot:pro", "github_copilot:pro_plus",
    "windsurf:pro",
  ]);
  const isIndividual = individualPlans.has(`${tool}:${plan}`);
  return isIndividual ? perSeat : perSeat * seats;
}

// ---------------------------------------------------------------------------
// Per-tool audit functions
// Each returns a Partial<ToolFinding> with recommendation + savings.
// ---------------------------------------------------------------------------

function auditCursor(entry: ToolEntry, teamSize: number): Partial<ToolFinding> {
  const { plan, seats, monthlySpend } = entry;

  // Business plan for ≤3 users: Pro is identical in features, half the price
  if (plan === "business" && seats <= 3) {
    const recommended = seats * 20;
    return {
      recommendation: "Downgrade to Cursor Pro",
      recommendedPlan: "pro",
      estimatedSpend: recommended,
      reason: `Cursor Business ($40/seat) adds admin controls and SSO, which a team of ${seats} doesn't need. Cursor Pro ($20/seat) has identical AI capabilities.`,
    };
  }

  // Pro+ or Ultra with a small team: likely overkill unless hitting credit limits daily
  if ((plan === "pro_plus" || plan === "ultra") && seats <= 2) {
    const recommended = seats * 20;
    return {
      recommendation: "Downgrade to Cursor Pro",
      recommendedPlan: "pro",
      estimatedSpend: recommended,
      reason: `${plan === "ultra" ? "Ultra ($200/seat)" : "Pro+ ($60/seat)"} is designed for developers exhausting Pro credits daily. For a ${seats}-person team, Pro ($20/seat) covers most usage.`,
    };
  }

  // Paying more than expected (possibly monthly vs annual mixup)
  const expected = expectedCost("cursor", plan, seats);
  if (monthlySpend > expected * 1.1) {
    return {
      recommendation: "Verify billing — you may be on monthly instead of annual",
      recommendedPlan: plan,
      estimatedSpend: expected,
      reason: `Your reported spend ($${monthlySpend}/mo) is higher than the listed $${expected}/mo for ${seats} × ${plan}. Annual billing saves ~20%.`,
    };
  }

  return { recommendation: "Plan looks appropriate", recommendedPlan: plan, estimatedSpend: monthlySpend };
}

function auditGithubCopilot(entry: ToolEntry, teamSize: number, hasOtherIDE: boolean): Partial<ToolFinding> {
  const { plan, seats, monthlySpend } = entry;

  // Enterprise for small teams: Business has the same core features
  if (plan === "enterprise" && seats < 20) {
    const recommended = seats * 19;
    return {
      recommendation: "Downgrade to Copilot Business",
      recommendedPlan: "business",
      estimatedSpend: recommended,
      reason: `Copilot Enterprise ($39/seat) adds fine-tuned private models and GitHub.com chat — features that matter at 20+ seats. Business ($19/seat) covers the same IDE and CLI access for teams under 20.`,
    };
  }

  // Business for ≤2 users: individual Pro plans are cheaper
  if (plan === "business" && seats <= 2) {
    const recommended = seats * 10;
    return {
      recommendation: "Switch to Copilot Pro (individual)",
      recommendedPlan: "pro",
      estimatedSpend: recommended,
      reason: `Copilot Business ($19/seat) requires org-level management that 2 developers don't need. Copilot Pro ($10/seat) provides the same AI completions and chat.`,
    };
  }

  // If also paying for Cursor: likely redundant
  if (hasOtherIDE) {
    return {
      recommendation: "Evaluate redundancy with your AI IDE",
      recommendedPlan: plan,
      estimatedSpend: monthlySpend,
      reason: `You're paying for both Copilot and an AI-native IDE (Cursor or Windsurf). These overlap heavily for coding completions. Most teams drop one after 30 days of comparison.`,
    };
  }

  return { recommendation: "Plan looks appropriate", recommendedPlan: plan, estimatedSpend: monthlySpend };
}

function auditClaude(entry: ToolEntry, teamSize: number): Partial<ToolFinding> {
  const { plan, seats, monthlySpend } = entry;

  // Max plans: only justified if hitting Pro limits regularly
  if (plan === "max_5x" || plan === "max_20x") {
    const price = plan === "max_5x" ? 100 : 200;
    return {
      recommendation: "Verify you're hitting Pro limits before keeping Max",
      recommendedPlan: "pro",
      estimatedSpend: 20,
      reason: `Claude Max (${price === 100 ? "$100" : "$200"}/mo) is worth it only if you hit Pro's daily limit multiple times a week. If not, Pro at $20/mo is identical in capability.`,
    };
  }

  // Team plan for ≤2 seats: individual Pro plans are cheaper
  if ((plan === "team_standard" || plan === "team_premium") && seats <= 2) {
    const recommended = seats * 20;
    return {
      recommendation: "Switch to individual Claude Pro plans",
      recommendedPlan: "pro",
      estimatedSpend: recommended,
      reason: `Claude Team ($25/seat) adds admin controls and centralized billing — not useful for ${seats} people. Individual Pro ($20/seat) is the same model with the same limits.`,
    };
  }

  // Team premium for non-heavy-usage teams
  if (plan === "team_premium" && teamSize < 10) {
    const recommended = seats * 25;
    return {
      recommendation: "Downgrade to Claude Team Standard",
      recommendedPlan: "team_standard",
      estimatedSpend: recommended,
      reason: `Team Premium ($125/seat) is the Max-equivalent for teams. Team Standard ($25/seat) covers most collaboration needs for teams under 10.`,
    };
  }

  return { recommendation: "Plan looks appropriate", recommendedPlan: plan, estimatedSpend: monthlySpend };
}

function auditChatGPT(entry: ToolEntry, teamSize: number, useCase: string): Partial<ToolFinding> {
  const { plan, seats, monthlySpend } = entry;

  // Pro at $200: very niche — only for unlimited reasoning model access
  if (plan === "pro") {
    return {
      recommendation: "Consider Claude Max 5x ($100/mo) as an alternative",
      recommendedPlan: "pro",
      estimatedSpend: monthlySpend,
      reason: `ChatGPT Pro ($200/mo) makes sense if you need unlimited o1/o3 reasoning access daily. Claude Max 5x ($100/mo) provides comparable reasoning at half the price for most use cases.`,
    };
  }

  // Business for ≤2 seats: Plus is cheaper
  if (plan === "business" && seats <= 2) {
    const recommended = seats * 20;
    return {
      recommendation: "Switch to individual ChatGPT Plus",
      recommendedPlan: "plus",
      estimatedSpend: recommended,
      reason: `ChatGPT Business ($25/seat) adds workspace admin and data privacy controls. For ${seats} people, individual Plus plans ($20/seat) are identical in model access and $${(25 - 20) * seats}/mo cheaper.`,
    };
  }

  // If primary use case is coding: Cursor is more purpose-built
  if (useCase === "coding" && (plan === "plus" || plan === "business")) {
    return {
      recommendation: "Consider Cursor Pro for coding-focused teams",
      recommendedPlan: plan,
      estimatedSpend: monthlySpend,
      reason: `ChatGPT ${plan} is a general-purpose assistant. For a coding-focused team, Cursor Pro ($20/seat) offers deeper codebase context, multi-file editing, and agentic coding at the same price point.`,
    };
  }

  return { recommendation: "Plan looks appropriate", recommendedPlan: plan, estimatedSpend: monthlySpend };
}

function auditGemini(entry: ToolEntry, useCase: string): Partial<ToolFinding> {
  const { plan, monthlySpend } = entry;

  // AI Ultra at $249.99: extremely niche
  if (plan === "ai_ultra") {
    return {
      recommendation: "Evaluate whether Ultra features are actually used",
      recommendedPlan: "ai_pro",
      estimatedSpend: 19.99,
      reason: `Google AI Ultra ($249.99/mo) adds Gemini Agent, Deep Think, and Veo video generation. If you're not using those specifically, Google AI Pro ($19.99/mo) provides the same Gemini model access.`,
    };
  }

  // AI Pro for non-Google-Workspace teams: Claude Pro or ChatGPT Plus may be stronger
  if (plan === "ai_pro" && useCase !== "mixed") {
    return {
      recommendation: "Compare against Claude Pro for your use case",
      recommendedPlan: plan,
      estimatedSpend: monthlySpend,
      reason: `Google AI Pro ($19.99/mo) is strongest for Google Workspace users. For ${useCase}-focused teams not in the Google ecosystem, Claude Pro ($20/mo) often performs better on benchmarks.`,
    };
  }

  return { recommendation: "Plan looks appropriate", recommendedPlan: plan, estimatedSpend: monthlySpend };
}

function auditWindsurf(entry: ToolEntry, hasOtherIDE: boolean): Partial<ToolFinding> {
  const { plan, seats, monthlySpend } = entry;

  // Teams plan for ≤2 users
  if (plan === "teams" && seats <= 2) {
    const recommended = seats * 15;
    return {
      recommendation: "Switch to individual Windsurf Pro plans",
      recommendedPlan: "pro",
      estimatedSpend: recommended,
      reason: `Windsurf Teams ($30/seat) adds admin controls and pooled credits. For ${seats} developers, individual Pro plans ($15/seat) have the same model access.`,
    };
  }

  // If also paying for Cursor: redundant
  if (hasOtherIDE) {
    return {
      recommendation: "Evaluate redundancy with your other AI IDE",
      recommendedPlan: plan,
      estimatedSpend: monthlySpend,
      reason: `Windsurf and Cursor are both agentic AI IDEs with similar capabilities. Paying for both is rarely justified — most teams settle on one after a month of comparison.`,
    };
  }

  return { recommendation: "Plan looks appropriate", recommendedPlan: plan, estimatedSpend: monthlySpend };
}

function auditAPITool(entry: ToolEntry): Partial<ToolFinding> {
  const { tool, monthlySpend } = entry;
  const isAnthropic = tool === "anthropic_api";

  // High API spend: subscription may be cheaper
  if (monthlySpend > 80) {
    const subscriptionName = isAnthropic ? "Claude Max 5x ($100/mo)" : "ChatGPT Plus ($20/mo)";
    return {
      recommendation: `Consider a subscription plan alongside direct API`,
      recommendedPlan: "direct",
      estimatedSpend: monthlySpend,
      reason: `At $${monthlySpend}/mo in API spend, a ${subscriptionName} subscription for interactive use could reduce token costs for conversational work, reserving the API for automated pipelines.`,
    };
  }

  return { recommendation: "API usage looks reasonable for your spend level", recommendedPlan: "direct", estimatedSpend: monthlySpend };
}

// ---------------------------------------------------------------------------
// Main audit function
// ---------------------------------------------------------------------------

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, primaryUseCase } = input;

  // Detect if user has multiple IDE tools (redundancy check)
  const ideTools = new Set(["cursor", "github_copilot", "windsurf"]);
  const userIDETools = tools.filter((t) => ideTools.has(t.tool));
  const hasMultipleIDEs = userIDETools.length > 1;

  const findings: ToolFinding[] = tools.map((entry) => {
    const { tool, plan, seats, monthlySpend } = entry;
    const hasOtherIDE = hasMultipleIDEs;

    let partial: Partial<ToolFinding> = {};

    switch (tool) {
      case "cursor":
        partial = auditCursor(entry, teamSize);
        break;
      case "github_copilot":
        partial = auditGithubCopilot(entry, teamSize, hasOtherIDE);
        break;
      case "claude":
        partial = auditClaude(entry, teamSize);
        break;
      case "chatgpt":
        partial = auditChatGPT(entry, teamSize, primaryUseCase);
        break;
      case "gemini":
        partial = auditGemini(entry, primaryUseCase);
        break;
      case "windsurf":
        partial = auditWindsurf(entry, hasOtherIDE);
        break;
      case "anthropic_api":
      case "openai_api":
        partial = auditAPITool(entry);
        break;
      default:
        partial = { recommendation: "No recommendation available", recommendedPlan: plan, estimatedSpend: monthlySpend };
    }

    const estimatedSpend = partial.estimatedSpend ?? monthlySpend;
    const monthlySavings = Math.max(0, monthlySpend - estimatedSpend);

    return {
      tool,
      currentPlan: plan,
      currentSpend: monthlySpend,
      recommendation: partial.recommendation ?? "Plan looks appropriate",
      recommendedPlan: partial.recommendedPlan ?? plan,
      estimatedSpend,
      monthlySavings,
      reason: partial.reason ?? "No changes recommended based on your team size and usage.",
    };
  });

  const totalMonthlySavings = findings.reduce((sum, f) => sum + f.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const isAlreadyOptimal = totalMonthlySavings < 5; // less than $5/mo savings = already optimal

  return {
    findings,
    totalMonthlySavings,
    totalAnnualSavings,
    isAlreadyOptimal,
  };
}