// src/app/audit/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { runAudit } from "@/lib/auditEngine";
import { AuditInput, AuditResult } from "@/types";
import { SavingsHero } from "@/components/SavingsHero";
import { FindingCard } from "@/components/FindingCard";
import { CredexCTA } from "@/components/CredexCTA";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Loader2 } from "lucide-react";

export default function AuditPage() {
  const router = useRouter();
  const [input, setInput]   = useState<AuditInput | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [summary, setSummary]   = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [emailCaptured, setEmailCaptured]   = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  // Load audit data and run the engine
  useEffect(() => {
    const raw = sessionStorage.getItem("audit-input");
    if (!raw) { router.replace("/"); return; }

    const parsedInput: AuditInput = JSON.parse(raw);
    const auditResult = runAudit(parsedInput);

    setInput(parsedInput);
    setResult(auditResult);

    // Fetch AI summary in parallel — don't block the UI
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: parsedInput, result: auditResult }),
    })
      .then((r) => r.json())
      .then((data) => setSummary(data.summary))
      .catch(() =>
        setSummary(
          "Your audit is complete. Review the findings below for actionable savings recommendations."
        )
      )
      .finally(() => setSummaryLoading(false));
  }, [router]);

  // Email capture handler — Day 5 will wire this to Supabase
  const handleEmailCapture = useCallback(async (email: string) => {
    // Placeholder — full implementation in Day 5
    console.log("Email captured:", email);
    setEmailCaptured(true);
  }, []);

  // Share button — full unique URLs in Day 5
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setShareMsg("Link copied!");
    setTimeout(() => setShareMsg(""), 2000);
  }, []);

  if (!result || !input) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  // Sort findings: biggest savings first
  const sortedFindings = [...result.findings].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Edit inputs
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5"
          >
            <Share2 size={14} />
            {shareMsg || "Share audit"}
          </Button>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Your AI Spend Audit</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {input.teamSize} person team · {input.primaryUseCase} focus ·{" "}
            {input.tools.length} tool{input.tools.length !== 1 ? "s" : ""} audited
          </p>
        </div>

        {/* Hero savings block */}
        <SavingsHero result={result} />

        {/* AI-generated summary */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            AI Analysis
          </p>
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              Generating personalised summary...
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{summary}</p>
          )}
        </div>

        {/* Per-tool breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Tool-by-tool breakdown
          </h2>
          {sortedFindings.map((finding) => (
            <FindingCard key={finding.tool} finding={finding} />
          ))}
        </div>

        {/* Credex CTA — adapts based on savings level */}
        {!emailCaptured ? (
          <CredexCTA result={result} onEmailCapture={handleEmailCapture} />
        ) : (
          <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 p-5 text-center">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              ✓ Got it — we'll be in touch
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Pricing data verified week of May 2025. Sources in{" "}
          
            href="https://github.com/YOUR_USERNAME/YOUR_REPO/blob/main/PRICING_DATA.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            PRICING_DATA.md
          </a>
        </p>
      </div>
    </main>
  );
}