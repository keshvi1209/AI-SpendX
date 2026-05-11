// src/components/SpendForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TOOL_CONFIGS, USE_CASES } from "@/lib/toolConfig";
import { ToolRow } from "./ToolRow";
import { AuditInput, ToolEntry, ToolName, UseCase } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Zap } from "lucide-react";

// Default empty entry for a newly added tool
const defaultEntry = (tool: ToolName): ToolEntry => ({
  tool,
  plan: "",
  seats: 1,
  monthlySpend: 0,
});

// What we persist to localStorage
interface SavedFormState {
  teamSize: number;
  primaryUseCase: UseCase;
  addedTools: ToolName[];
  toolEntries: Record<ToolName, ToolEntry>;
}

const INITIAL_STATE: SavedFormState = {
  teamSize: 1,
  primaryUseCase: "coding",
  addedTools: [],
  toolEntries: {} as Record<ToolName, ToolEntry>,
};

export function SpendForm() {
  const router = useRouter();
  const [formState, setFormState] = useLocalStorage<SavedFormState>(
    "spend-audit-form",
    INITIAL_STATE
  );
  const [errors, setErrors] = useState<string[]>([]);

  const { teamSize, primaryUseCase, addedTools, toolEntries } = formState;

  // Add a tool to the form
  function addTool(toolId: ToolName) {
    if (addedTools.includes(toolId)) return;
    setFormState((prev) => ({
      ...prev,
      addedTools: [...prev.addedTools, toolId],
      toolEntries: {
        ...prev.toolEntries,
        [toolId]: defaultEntry(toolId),
      },
    }));
  }

  // Remove a tool from the form
  function removeTool(toolId: ToolName) {
    setFormState((prev) => {
      const updated = { ...prev.toolEntries };
      delete updated[toolId];
      return {
        ...prev,
        addedTools: prev.addedTools.filter((t) => t !== toolId),
        toolEntries: updated,
      };
    });
  }

  // Update a single tool entry
  function updateTool(toolId: ToolName, updated: ToolEntry) {
    setFormState((prev) => ({
      ...prev,
      toolEntries: { ...prev.toolEntries, [toolId]: updated },
    }));
  }

  // Validate before submitting
  function validate(): string[] {
    const errs: string[] = [];
    if (addedTools.length === 0)
      errs.push("Add at least one AI tool to audit.");
    if (teamSize < 1)
      errs.push("Team size must be at least 1.");
    for (const toolId of addedTools) {
      const entry = toolEntries[toolId];
      if (!entry?.plan)
        errs.push(`Select a plan for ${TOOL_CONFIGS.find((t) => t.id === toolId)?.label}.`);
    }
    return errs;
  }

  // Submit: build AuditInput, store in sessionStorage, navigate to results
  function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);

    const auditInput: AuditInput = {
      teamSize,
      primaryUseCase,
      tools: addedTools.map((toolId) => toolEntries[toolId]),
    };

    // Store audit input for the results page
    sessionStorage.setItem("audit-input", JSON.stringify(auditInput));
    router.push("/audit");
  }

  // Tools not yet added (for the "add tool" selector)
  const availableToAdd = TOOL_CONFIGS.filter(
    (t) => !addedTools.includes(t.id as ToolName)
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          AI Spend Audit
        </h1>
        <p className="text-muted-foreground mt-1">
          Add the AI tools your team pays for. We'll find where you're overspending.
        </p>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-1">
          {errors.map((e) => (
            <p key={e} className="text-sm text-destructive">{e}</p>
          ))}
        </div>
      )}

      {/* Team context */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Your team
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="teamSize" className="text-sm">Team size</Label>
            <Input
              id="teamSize"
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  teamSize: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="useCase" className="text-sm">Primary use case</Label>
            <Select
              value={primaryUseCase}
              onValueChange={(v) =>
                setFormState((prev) => ({
                  ...prev,
                  primaryUseCase: v as UseCase,
                }))
              }
            >
              <SelectTrigger id="useCase" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USE_CASES.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Added tools */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          AI tools you pay for
        </h2>

        {addedTools.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            No tools added yet. Add your first tool below.
          </p>
        )}

        {addedTools.map((toolId) => {
          const config = TOOL_CONFIGS.find((t) => t.id === toolId)!;
          return (
            <ToolRow
              key={toolId}
              tool={config}
              entry={toolEntries[toolId]}
              onChange={(updated) => updateTool(toolId as ToolName, updated)}
              onRemove={() => removeTool(toolId as ToolName)}
            />
          );
        })}
      </div>

      {/* Add tool section */}
      {availableToAdd.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Add a tool</Label>
          <div className="flex flex-wrap gap-2">
            {availableToAdd.map((tool) => (
              <button
                key={tool.id}
                onClick={() => addTool(tool.id as ToolName)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-muted transition-colors"
              >
                <Plus size={12} />
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Total preview */}
      {addedTools.length > 0 && (
        <div className="rounded-lg bg-muted p-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Current monthly spend
          </span>
          <span className="font-semibold text-lg">
            $
            {Object.values(toolEntries)
              .reduce((sum, e) => sum + (e.monthlySpend || 0), 0)
              .toFixed(2)}
            /mo
          </span>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        className="w-full h-12 text-base gap-2"
        disabled={addedTools.length === 0}
      >
        <Zap size={18} />
        Run my audit
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        No account required. Your data stays in your browser until you submit.
      </p>
    </div>
  );
}