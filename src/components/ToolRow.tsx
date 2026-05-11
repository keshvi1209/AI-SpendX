// src/components/ToolRow.tsx
// One row = one tool the user pays for.

"use client";

import { ToolConfig } from "@/lib/toolConfig";
import { ToolEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface ToolRowProps {
  tool: ToolConfig;
  entry: ToolEntry;
  onChange: (updated: ToolEntry) => void;
  onRemove: () => void;
}

export function ToolRow({ tool, entry, onChange, onRemove }: ToolRowProps) {
  return (
    <div className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/40 rounded-lg border border-border">
      
      {/* Tool name (read-only label) */}
      <div className="col-span-12 sm:col-span-3">
        <Label className="text-xs text-muted-foreground mb-1 block">Tool</Label>
        <p className="font-medium text-sm">{tool.label}</p>
      </div>

      {/* Plan dropdown */}
      <div className="col-span-12 sm:col-span-3">
        <Label className="text-xs text-muted-foreground mb-1 block">Plan</Label>
        <Select
          value={entry.plan}
          onValueChange={(plan) => onChange({ ...entry, plan })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            {tool.plans.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Number of seats */}
      <div className="col-span-5 sm:col-span-2">
        <Label className="text-xs text-muted-foreground mb-1 block">Seats</Label>
        <Input
          type="number"
          min={1}
          value={entry.seats}
          onChange={(e) =>
            onChange({ ...entry, seats: Math.max(1, parseInt(e.target.value) || 1) })
          }
          className="h-9 text-sm"
        />
      </div>

      {/* Monthly spend */}
      <div className="col-span-5 sm:col-span-3">
        <Label className="text-xs text-muted-foreground mb-1 block">
          Monthly spend ($)
        </Label>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={entry.monthlySpend}
            onChange={(e) =>
              onChange({
                ...entry,
                monthlySpend: Math.max(0, parseFloat(e.target.value) || 0),
              })
            }
            className="h-9 text-sm pl-6"
          />
        </div>
      </div>

      {/* Remove button */}
      <div className="col-span-2 sm:col-span-1 flex items-end justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${tool.label}`}
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}