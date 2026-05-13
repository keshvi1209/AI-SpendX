// src/__tests__/auditEngine.test.ts
import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/auditEngine";
import { AuditInput } from "@/types";

// ---------------------------------------------------------------------------
// Test 1: Business plan for a tiny team → recommend Pro
// ---------------------------------------------------------------------------
describe("Cursor audit", () => {
  it("recommends downgrade from Business to Pro for teams ≤3", () => {
    const input: AuditInput = {
      teamSize: 3,
      primaryUseCase: "coding",
      tools: [
        { tool: "cursor", plan: "business", seats: 3, monthlySpend: 120 },
      ],
    };
    const result = runAudit(input);
    const finding = result.findings[0];

    expect(finding.recommendedPlan).toBe("pro");
    expect(finding.estimatedSpend).toBe(60); // 3 × $20
    expect(finding.monthlySavings).toBe(60); // $120 - $60
    expect(result.totalMonthlySavings).toBe(60);
    expect(result.totalAnnualSavings).toBe(720);
  });

  it("finds no savings when already on correct Pro plan", () => {
    const input: AuditInput = {
      teamSize: 1,
      primaryUseCase: "coding",
      tools: [
        { tool: "cursor", plan: "pro", seats: 1, monthlySpend: 20 },
      ],
    };
    const result = runAudit(input);
    expect(result.findings[0].monthlySavings).toBe(0);
    expect(result.isAlreadyOptimal).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Test 2: GitHub Copilot Enterprise overkill for small team
// ---------------------------------------------------------------------------
describe("GitHub Copilot audit", () => {
  it("recommends Business over Enterprise for teams under 20", () => {
    const input: AuditInput = {
      teamSize: 5,
      primaryUseCase: "coding",
      tools: [
        { tool: "github_copilot", plan: "enterprise", seats: 5, monthlySpend: 195 },
      ],
    };
    const result = runAudit(input);
    const finding = result.findings[0];

    expect(finding.recommendedPlan).toBe("business");
    expect(finding.estimatedSpend).toBe(95); // 5 × $19
    expect(finding.monthlySavings).toBe(100);
  });

  it("flags redundancy when user has both Copilot and Cursor", () => {
    const input: AuditInput = {
      teamSize: 4,
      primaryUseCase: "coding",
      tools: [
        { tool: "cursor", plan: "pro", seats: 4, monthlySpend: 80 },
        { tool: "github_copilot", plan: "business", seats: 4, monthlySpend: 76 },
      ],
    };
    const result = runAudit(input);
    const copilotFinding = result.findings.find((f) => f.tool === "github_copilot");
    expect(copilotFinding?.recommendation).toContain("redundan");
  });
});

// ---------------------------------------------------------------------------
// Test 3: Claude Max plan check
// ---------------------------------------------------------------------------
describe("Claude audit", () => {
  it("questions Max plan and recommends Pro as baseline", () => {
    const input: AuditInput = {
      teamSize: 1,
      primaryUseCase: "writing",
      tools: [
        { tool: "claude", plan: "max_5x", seats: 1, monthlySpend: 100 },
      ],
    };
    const result = runAudit(input);
    const finding = result.findings[0];

    expect(finding.recommendedPlan).toBe("pro");
    expect(finding.estimatedSpend).toBe(20);
    expect(finding.monthlySavings).toBe(80);
  });

  it("recommends individual Pro over Team plan for 2 seats", () => {
    const input: AuditInput = {
      teamSize: 2,
      primaryUseCase: "writing",
      tools: [
        { tool: "claude", plan: "team_standard", seats: 2, monthlySpend: 50 },
      ],
    };
    const result = runAudit(input);
    const finding = result.findings[0];

    expect(finding.recommendedPlan).toBe("pro");
    expect(finding.estimatedSpend).toBe(40); // 2 × $20
    expect(finding.monthlySavings).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Test 4: ChatGPT Pro is expensive — suggest Claude alternative
// ---------------------------------------------------------------------------
describe("ChatGPT audit", () => {
  it("surfaces Claude Max 5x as cheaper alternative to ChatGPT Pro", () => {
    const input: AuditInput = {
      teamSize: 1,
      primaryUseCase: "research",
      tools: [
        { tool: "chatgpt", plan: "pro", seats: 1, monthlySpend: 200 },
      ],
    };
    const result = runAudit(input);
    const finding = result.findings[0];

    // Recommendation should mention Claude
    expect(finding.reason.toLowerCase()).toContain("claude");
  });
});

// ---------------------------------------------------------------------------
// Test 5: Total savings calculation across multiple tools
// ---------------------------------------------------------------------------
describe("Total savings", () => {
  it("correctly sums savings across multiple tools", () => {
    const input: AuditInput = {
      teamSize: 3,
      primaryUseCase: "coding",
      tools: [
        // Business for 3 → Pro: saves $60
        { tool: "cursor", plan: "business", seats: 3, monthlySpend: 120 },
        // Enterprise for 3 → Business: saves $60
        { tool: "github_copilot", plan: "enterprise", seats: 3, monthlySpend: 117 },
      ],
    };
    const result = runAudit(input);

    expect(result.totalMonthlySavings).toBeGreaterThan(100);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
    expect(result.isAlreadyOptimal).toBe(false);
  });

  it("marks result as optimal when savings are under $5/mo", () => {
    const input: AuditInput = {
      teamSize: 1,
      primaryUseCase: "coding",
      tools: [
        { tool: "cursor", plan: "pro", seats: 1, monthlySpend: 20 },
        { tool: "claude", plan: "pro", seats: 1, monthlySpend: 20 },
      ],
    };
    const result = runAudit(input);
    expect(result.isAlreadyOptimal).toBe(true);
    expect(result.totalMonthlySavings).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Test 6: Gemini Ultra is almost always overkill
// ---------------------------------------------------------------------------
describe("Gemini audit", () => {
  it("recommends AI Pro over AI Ultra", () => {
    const input: AuditInput = {
      teamSize: 1,
      primaryUseCase: "mixed",
      tools: [
        { tool: "gemini", plan: "ai_ultra", seats: 1, monthlySpend: 249.99 },
      ],
    };
    const result = runAudit(input);
    const finding = result.findings[0];

    expect(finding.recommendedPlan).toBe("ai_pro");
    expect(finding.estimatedSpend).toBeCloseTo(19.99, 1);
    expect(finding.monthlySavings).toBeCloseTo(230, 0);
  });
});