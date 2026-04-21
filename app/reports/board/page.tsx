"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionLabel } from "@/components/cerulean/SectionLabel";

const agenda = [
  {
    title: "Kalder — omission cluster",
    summary: "Revenue narrative absent across U11–U14 vs historical baseline.",
    priority: "High",
  },
  {
    title: "Nate — cadence",
    summary: "Silent window extended beyond historical band.",
    priority: "Medium",
  },
  {
    title: "AllHere — metric depth",
    summary: "Metric count contraction without cross-reference language.",
    priority: "High",
  },
  {
    title: "Atlas — authorship distance",
    summary: "Syntactic shift vs founder baseline — corroborating only.",
    priority: "Low",
  },
];

export default function BoardBriefPage() {
  return (
    <div className="p-8">
      <div className="mb-6 max-w-xs">
        <label className="mb-1 block text-[12px] uppercase text-text-3">
          Company focus
        </label>
        <Select defaultValue="kalder">
          <SelectTrigger className="border-border bg-bg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kalder">Kalder Inc.</SelectItem>
            <SelectItem value="portfolio">Portfolio-wide</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <h1 className="mb-6 text-page-title text-text-1">Board meeting brief</h1>

      <SectionLabel className="mb-3">Agenda</SectionLabel>
      <div className="mb-8 space-y-3">
        {agenda.map((a, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-bg-2 p-4"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-card-title text-text-1">{a.title}</span>
              <span
                className={
                  a.priority === "High"
                    ? "rounded bg-red-light px-2 py-0.5 text-[12px] text-red"
                    : a.priority === "Medium"
                      ? "rounded bg-amber-light px-2 py-0.5 text-[12px] text-amber"
                      : "rounded bg-bg-3 px-2 py-0.5 text-[12px] text-text-3"
                }
              >
                {a.priority}
              </span>
            </div>
            <p className="text-body text-text-2">{a.summary}</p>
          </div>
        ))}
      </div>

      <SectionLabel className="mb-3">External context</SectionLabel>
      <p className="text-body text-text-2">
        Macro and sector feeds are connected; this section lists cross-checks
        only — no forward-looking language.
      </p>
    </div>
  );
}
