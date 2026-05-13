// src/components/SavingsHero.tsx
"use client";

import { AuditResult } from "@/types";
import { TrendingDown, CheckCircle } from "lucide-react";

interface SavingsHeroProps {
  result: AuditResult;
}

export function SavingsHero({ result }: SavingsHeroProps) {
  const { totalMonthlySavings, totalAnnualSavings, isAlreadyOptimal } = result;

  if (isAlreadyOptimal) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-8 text-center space-y-2">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
            <CheckCircle className="text-green-600 dark:text-green-400" size={28} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-300">
          You're spending well
        </h2>
        <p className="text-green-700 dark:text-green-400 text-sm max-w-sm mx-auto">
          Less than $5/month in potential savings found. Your current AI stack
          is well-matched to your team size and use case.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 dark:border-amber-800 p-8 text-center space-y-4">
      <div className="flex justify-center">
        <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3">
          <TrendingDown className="text-amber-600 dark:text-amber-400" size={28} />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
          Potential savings found
        </p>
        <p className="text-6xl font-bold text-amber-900 dark:text-amber-100 tracking-tight">
          ${totalMonthlySavings.toFixed(0)}
          <span className="text-2xl font-normal text-amber-700 dark:text-amber-400">/mo</span>
        </p>
        <p className="text-xl text-amber-700 dark:text-amber-300 mt-1">
          ${totalAnnualSavings.toFixed(0)} saved per year
        </p>
      </div>

      <p className="text-sm text-amber-700/80 dark:text-amber-400/80 max-w-xs mx-auto">
        Based on right-sizing your plans — no tool switching required.
      </p>
    </div>
  );
}