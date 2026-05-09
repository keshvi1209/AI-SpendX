// src/lib/pricingData.ts
// Prices in USD per seat per month (monthly billing)
// Every number sourced from PRICING_DATA.md
// Last verified: 2026-05-09

export interface PlanInfo {
  price: number | null;   // null = custom/contact sales
  label: string;
  annualPrice?: number;   // price if billed annually
}

export const PRICING = {
  cursor: {
    hobby:      { price: 0,    label: "Hobby (Free)" },
    pro:        { price: 20,   label: "Pro", annualPrice: 16 },
    pro_plus:   { price: 60,   label: "Pro+", annualPrice: 48 },
    ultra:      { price: 200,  label: "Ultra" },
    teams:      { price: 40,   label: "Teams", annualPrice: 32 },
    enterprise: { price: null, label: "Enterprise (custom)" },
  },

  github_copilot: {
    free:       { price: 0,    label: "Free (limited)" },
    pro:        { price: 10,   label: "Pro", annualPrice: 8.33 },
    pro_plus:   { price: 39,   label: "Pro+" },
    business:   { price: 19,   label: "Business" },
    enterprise: { price: 39,   label: "Enterprise (+ GH Enterprise Cloud ~$21)" },
  },

  claude: {
    free:           { price: 0,    label: "Free" },
    pro:            { price: 20,   label: "Pro", annualPrice: 17 },
    max_5x:         { price: 100,  label: "Max 5x" },
    max_20x:        { price: 200,  label: "Max 20x" },
    team_standard:  { price: 25,   label: "Team Standard", annualPrice: 20 },
    team_premium:   { price: 125,  label: "Team Premium (incl. Claude Code)", annualPrice: 100 },
    enterprise:     { price: null, label: "Enterprise (custom)" },
    api_direct:     { price: null, label: "API Direct (pay-per-token)" },
  },

  chatgpt: {
    free:       { price: 0,    label: "Free" },
    go:         { price: 8,    label: "Go" },
    plus:       { price: 20,   label: "Plus" },
    pro_100:    { price: 100,  label: "Pro ($100)" },
    pro_200:    { price: 200,  label: "Pro ($200)" },
    business:   { price: 25,   label: "Business", annualPrice: 20 },
    enterprise: { price: null, label: "Enterprise (custom)" },
    api_direct: { price: null, label: "API Direct (pay-per-token)" },
  },

  anthropic_api: {
    // No flat fee — user enters their actual monthly spend
    haiku_45:   { pricePerMInputToken: 1.00,  pricePerMOutputToken: 5.00,  label: "Claude Haiku 4.5" },
    sonnet_46:  { pricePerMInputToken: 3.00,  pricePerMOutputToken: 15.00, label: "Claude Sonnet 4.6" },
    opus_46:    { pricePerMInputToken: 5.00,  pricePerMOutputToken: 25.00, label: "Claude Opus 4.6" },
  },

  openai_api: {
    // No flat fee — user enters their actual monthly spend
    gpt5_mini:  { pricePerMInputToken: 0.25,  pricePerMOutputToken: 2.00,  label: "GPT-5 mini" },
    gpt5:       { pricePerMInputToken: 1.25,  pricePerMOutputToken: 10.00, label: "GPT-5" },
    gpt55:      { pricePerMInputToken: 5.00,  pricePerMOutputToken: 30.00, label: "GPT-5.5" },
  },

  gemini: {
    free:      { price: 0,   label: "Free (Gemini 2.5 Flash, limited)" },
    ai_pro:    { price: 20,  label: "AI Pro (Google One AI Premium)" },
    ai_ultra:  { price: 250, label: "AI Ultra" },
  },

  windsurf: {
    free:       { price: 0,    label: "Free (25 credits/month)" },
    pro:        { price: 15,   label: "Pro (500 credits/month)" },
    teams:      { price: 30,   label: "Teams (500 credits/user + admin)" },
    enterprise: { price: null, label: "Enterprise (custom, ~$60/user)" },
  },
} as const;

// ─── Cheaper same-vendor alternatives ────────────────────────────────────────
// Used by the audit engine to suggest downgrades

export const SAME_VENDOR_ALTERNATIVES: Record<string, Record<string, string>> = {
  cursor: {
    teams: "pro",           // Teams->Pro if <3 seats using team features
    ultra: "pro_plus",      // Ultra->Pro+ if usage doesn't justify 20x
    pro_plus: "pro",        // Pro+->Pro if usage doesn't justify 3x credits
  },
  github_copilot: {
    enterprise: "business", // Enterprise->Business for teams <50 who don't need knowledge bases
    business: "pro",        // Business->Pro if team is 1-2 people with no compliance needs
    pro_plus: "pro",        // Pro+->Pro unless hitting 300+ premium requests/month
  },
  claude: {
    max_20x: "max_5x",          // Max 20x->Max 5x: only justified for extremely heavy users
    max_5x: "pro",              // Max 5x->Pro: only if hitting Pro limits regularly
    team_premium: "team_standard", // Team Premium->Standard: only if Claude Code is needed
    enterprise: "team_standard",   // Enterprise->Team: for teams <150 without compliance requirements
  },
  chatgpt: {
    pro_200: "pro_100",   // Pro $200->Pro $100: same models, 4x less usage
    pro_100: "plus",      // Pro $100->Plus: if not consistently hitting Plus limits
    enterprise: "business", // Enterprise->Business for teams <150
    business: "plus",     // Business->Plus: for 1-person teams
  },
  gemini: {
    ai_ultra: "ai_pro",   // Ultra->Pro: unless using Gemini for heavy multimodal workloads
  },
  windsurf: {
    teams: "pro",         // Teams->Pro if individual developer (no team features needed)
    enterprise: "teams",  // Enterprise->Teams for orgs <200 without RBAC needs
  },
};

// ─── Cross-vendor alternatives by use case ───────────────────────────────────
// Used by audit engine to suggest switching tools entirely

export const CROSS_VENDOR_ALTERNATIVES = {
  coding: {
    // If on Cursor Teams ($40/seat), GitHub Copilot Business ($19/seat) saves 52%
    // with similar completions, less capable agent mode
    cursor_teams_vs_copilot_business: {
      from: "cursor.teams",
      to: "github_copilot.business",
      savingsPercent: 52,
      caveat: "GitHub Copilot has less capable agentic features than Cursor; suitable if team doesn't use Cursor Composer heavily",
    },
    // Windsurf Pro ($15) vs Cursor Pro ($20)
    cursor_pro_vs_windsurf_pro: {
      from: "cursor.pro",
      to: "windsurf.pro",
      savingsPercent: 25,
      caveat: "Feature parity for most use cases; Cursor has edge in large-codebase agentic tasks",
    },
  },
  writing: {
    // ChatGPT Plus ($20) vs Claude Pro ($20) — same price, Claude better for writing
    // This isn't a savings case but a quality flag
  },
  mixed: {
    // Claude Pro ($20) vs ChatGPT Plus ($20) — same price, audit flags capability differences
  },
} as const;