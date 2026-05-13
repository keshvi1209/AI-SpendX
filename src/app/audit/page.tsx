// src/app/audit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { runAudit } from "@/lib/auditEngine";
import { AuditInput, AuditResult } from "@/types";

export default function AuditPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("audit-input");
    if (!raw) {
      router.replace("/");
      return;
    }
    const input: AuditInput = JSON.parse(raw);
    const auditResult = runAudit(input);
    setResult(auditResult);
  }, [router]);

  if (!result) return <p className="p-8 text-muted-foreground">Running audit...</p>;

  // Temporary raw output — proper UI is Day 4
  return (
    <pre className="p-8 text-xs overflow-auto">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}