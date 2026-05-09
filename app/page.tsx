"use client";

import { useState, useEffect } from "react";

const TOOLS = [
  "Cursor", "ChatGPT", "Claude", "Gemini", 
  "Copilot", "Anthropic API", "OpenAI API", "Replicate"
];

export default function Home() {
  // 1. Initialize state from localStorage or defaults
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("spendFormData");
      return saved ? JSON.parse(saved) : {
        toolName: "",
        plan: "",
        monthlySpend: "",
        seats: "",
        teamSize: "",
        useCase: ""
      };
    }
    return { toolName: "", plan: "", monthlySpend: "", seats: "", teamSize: "", useCase: "" };
  });

  // 2. Persist to localStorage
  useEffect(() => {
    localStorage.setItem("spendFormData", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-[#0c0c0c] p-4">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#141414] sm:p-12">
        
        {/* Header Section */}
        <div className="mb-10 border-b border-zinc-100 pb-6 dark:border-zinc-800">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Spend Input Form
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Enter your tool details below. Your progress is saved automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Tool Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tool Name</label>
            <select
              name="toolName"
              value={formData.toolName}
              onChange={handleChange}
              className="h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
            >
              <option value="">Select a tool</option>
              {TOOLS.map((tool) => (
                <option key={tool} value={tool}>{tool}</option>
              ))}
            </select>
          </div>

          {/* Plan */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Plan</label>
            <input
              type="text"
              name="plan"
              placeholder="e.g. Pro, Enterprise"
              value={formData.plan}
              onChange={handleChange}
              className="h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Monthly Spend */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Monthly Spend ($)</label>
            <input
              type="number"
              name="monthlySpend"
              placeholder="0.00"
              value={formData.monthlySpend}
              onChange={handleChange}
              className="h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Seats */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Seats</label>
            <input
              type="number"
              name="seats"
              placeholder="1"
              value={formData.seats}
              onChange={handleChange}
              className="h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Team Size */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Team Size</label>
            <input
              type="number"
              name="teamSize"
              placeholder="e.g. 50"
              value={formData.teamSize}
              onChange={handleChange}
              className="h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Use Case - Spans 2 columns on desktop */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Use Case</label>
            <textarea
              name="useCase"
              rows={3}
              placeholder="Describe how the team uses this tool..."
              value={formData.useCase}
              onChange={handleChange}
              className="rounded-lg border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10 flex justify-end">
          <button
            onClick={() => alert("Form Data Saved!")}
            className="flex h-11 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Confirm Details
          </button>
        </div>
      </main>
    </div>
  );
}