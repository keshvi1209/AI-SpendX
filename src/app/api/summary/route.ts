// src/app/api/summary/route.ts
// Calls Anthropic API to generate a personalised ~100-word audit summary.
// Falls back to a template if the API fails — never shows a broken UI.

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { AuditResult, AuditInput } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Template fallback — used when the API fails
function templateSummary(input: AuditInput, result: AuditResult): string {
  if (result.isAlreadyOptimal) {
    return `Your team of ${input.teamSize} is spending well on AI tools. Based on your ${input.primaryUseCase}-focused workflow, your current stack appears well-matched to your needs. We found less than $5/month in potential savings — which means you've already made smart plan choices. Keep an eye out as vendor pricing evolves, especially with GitHub Copilot's upcoming usage-based billing changes in June 2026.`;
  }
  const topSaving = [...result.findings].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  return `Your team of ${input.teamSize} could save $${result.totalMonthlySavings.toFixed(0)}/month ($${result.totalAnnualSavings.toFixed(0)}/year) on AI tools. The biggest opportunity is ${topSaving?.tool.replace("_", " ")}, where ${topSaving?.reason} These optimisations don't require switching tools — just right-sizing your plans to your actual usage and team size.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, result }: { input: AuditInput; result: AuditResult } = body;

    // Build a concise context string for the prompt
    const toolSummary = result.findings
      .map((f) =>
        f.monthlySavings > 0
          ? `${f.tool}: currently $${f.currentSpend}/mo, recommended $${f.estimatedSpend}/mo (saves $${f.monthlySavings}/mo) — ${f.reason}`
          : `${f.tool}: $${f.currentSpend}/mo — already optimal`
      )
      .join("\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 180,
      messages: [
        {
          role: "user",
          content: `You are an AI spend analyst. Write a 90-110 word personalised summary for this audit. Be specific, use the actual numbers, and end with one actionable insight. Do not use bullet points. Plain prose only.

Team size: ${input.teamSize}
Primary use case: ${input.primaryUseCase}
Total monthly savings found: $${result.totalMonthlySavings.toFixed(0)}
Annual savings: $${result.totalAnnualSavings.toFixed(0)}

Per-tool findings:
${toolSummary}

Write the summary now:`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : null;

    if (!text) throw new Error("Empty response from API");

    return NextResponse.json({ summary: text, source: "ai" });
  } catch (err) {
    console.error("Anthropic API error:", err);

    // Always return 200 with a fallback — never let this break the UI
    try {
      const body = await req.clone().json();
      const fallback = templateSummary(body.input, body.result);
      return NextResponse.json({ summary: fallback, source: "template" });
    } catch {
      return NextResponse.json({
        summary: "Your audit is complete. Review the findings below to see where your team can optimise AI spend.",
        source: "template",
      });
    }
  }
}