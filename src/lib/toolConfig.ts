// src/lib/toolConfig.ts

export interface ToolOption {
  value: string;
  label: string;
}

export interface ToolConfig {
  id: string;
  label: string;          // display name
  plans: ToolOption[];
  category: "ide" | "chat" | "api";
}

export const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: "cursor",
    label: "Cursor",
    category: "ide",
    plans: [
      { value: "hobby",      label: "Hobby (Free)" },
      { value: "pro",        label: "Pro — $20/seat" },
      { value: "pro_plus",   label: "Pro+ — $60/seat" },
      { value: "ultra",      label: "Ultra — $200/seat" },
      { value: "business",   label: "Business — $40/seat" },
      { value: "enterprise", label: "Enterprise (custom)" },
    ],
  },
  {
    id: "github_copilot",
    label: "GitHub Copilot",
    category: "ide",
    plans: [
      { value: "free",       label: "Free" },
      { value: "pro",        label: "Pro — $10/seat" },
      { value: "pro_plus",   label: "Pro+ — $39/seat" },
      { value: "business",   label: "Business — $19/seat" },
      { value: "enterprise", label: "Enterprise — $39/seat" },
    ],
  },
  {
    id: "claude",
    label: "Claude (claude.ai)",
    category: "chat",
    plans: [
      { value: "free",          label: "Free" },
      { value: "pro",           label: "Pro — $20/mo" },
      { value: "max_5x",        label: "Max 5x — $100/mo" },
      { value: "max_20x",       label: "Max 20x — $200/mo" },
      { value: "team_standard", label: "Team Standard — $25/seat" },
      { value: "team_premium",  label: "Team Premium — $125/seat" },
      { value: "enterprise",    label: "Enterprise (custom)" },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT (OpenAI)",
    category: "chat",
    plans: [
      { value: "free",       label: "Free" },
      { value: "plus",       label: "Plus — $20/mo" },
      { value: "pro",        label: "Pro — $200/mo" },
      { value: "business",   label: "Business/Team — $25/seat" },
      { value: "enterprise", label: "Enterprise (custom)" },
    ],
  },
  {
    id: "anthropic_api",
    label: "Anthropic API (direct)",
    category: "api",
    plans: [
      { value: "direct", label: "Pay-per-token (direct API)" },
    ],
  },
  {
    id: "openai_api",
    label: "OpenAI API (direct)",
    category: "api",
    plans: [
      { value: "direct", label: "Pay-per-token (direct API)" },
    ],
  },
  {
    id: "gemini",
    label: "Gemini (Google)",
    category: "chat",
    plans: [
      { value: "free",      label: "Free" },
      { value: "ai_pro",    label: "Google AI Pro — $19.99/mo" },
      { value: "ai_ultra",  label: "Google AI Ultra — $249.99/mo" },
    ],
  },
  {
    id: "windsurf",
    label: "Windsurf",
    category: "ide",
    plans: [
      { value: "free",       label: "Free (25 credits/mo)" },
      { value: "pro",        label: "Pro — $15/mo" },
      { value: "teams",      label: "Teams — $30/seat" },
      { value: "enterprise", label: "Enterprise (custom)" },
    ],
  },
];

export const USE_CASES = [
  { value: "coding",   label: "Coding / Engineering" },
  { value: "writing",  label: "Writing / Content" },
  { value: "data",     label: "Data / Analysis" },
  { value: "research", label: "Research" },
  { value: "mixed",    label: "Mixed" },
] as const;