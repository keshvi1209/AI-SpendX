// src/components/CredexCTA.tsx
// Shown prominently when savings > $500/mo.
// Honest "notify me" signup shown when savings are low.

"use client";

import { AuditResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Zap, Bell } from "lucide-react";

interface CredexCTAProps {
  result: AuditResult;
  onEmailCapture: (email: string) => void;
}

export function CredexCTA({ result, onEmailCapture }: CredexCTAProps) {
  const [email, setEmail] = useState("");
  const { totalMonthlySavings, isAlreadyOptimal } = result;
  const isHighSavings = totalMonthlySavings >= 500;

  if (isHighSavings) {
    return (
      <div className="rounded-2xl bg-foreground text-background p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400 uppercase tracking-wide">
            High savings detected
          </span>
        </div>
        <h2 className="text-2xl font-bold">
          Get these savings in practice
        </h2>
        <p className="text-background/70 text-sm leading-relaxed">
          Credex sells discounted AI infrastructure credits — the same tools
          you're already using (Cursor, Claude, ChatGPT) at 20–40% below retail,
          sourced from companies that overforecast. Your audit shows ${totalMonthlySavings.toFixed(0)}/mo
          in plan optimisations — Credex can capture even more on top of that.
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background/10 border-background/20 text-background placeholder:text-background/40"
          />
          <Button
            onClick={() => email && onEmailCapture(email)}
            className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300 shrink-0"
          >
            Book a call
          </Button>
        </div>
        <p className="text-xs text-background/50">
          Free consultation. No obligation. Credex reaches out within 24h for
          high-savings cases.
        </p>
      </div>
    );
  }

  // Low savings or already optimal — honest "notify me" CTA
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">Stay ahead of pricing changes</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {isAlreadyOptimal
          ? "Your stack is optimised right now. AI tool pricing changes frequently — get notified when new savings opportunities apply to your stack."
          : "Enter your email to receive your full audit report and get notified when new optimisations apply to your stack."}
      </p>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          variant="outline"
          onClick={() => email && onEmailCapture(email)}
          className="shrink-0"
        >
          Notify me
        </Button>
      </div>
    </div>
  );
}