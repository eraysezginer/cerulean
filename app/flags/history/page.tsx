"use client";

import { getTimelineForCompany } from "@/data/timeline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function FlagHistoryPage() {
  const events = getTimelineForCompany("kalder");

  return (
    <div className="p-8">
      <div className="mb-6 max-w-xs">
        <label className="mb-1 block text-[12px] uppercase text-text-3">
          Company
        </label>
        <Select defaultValue="kalder">
          <SelectTrigger className="border-border bg-bg">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kalder">Kalder Inc.</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <h1 className="mb-2 text-page-title text-text-1">
        Flag history & timeline
      </h1>
      <p className="mb-6 font-medium text-red">
        Material event: SEC enforcement action Feb 14, 2026
      </p>

      <p className="mb-4 text-section-label uppercase text-text-3">
        Early warning reconstruction
      </p>
      <div className="relative space-y-0 border-l-2 border-border pl-6">
        {events.map((e) => (
          <div
            key={e.id}
            className={cn(
              "relative pb-6 last:pb-0",
              e.isMaterial && "font-medium text-red"
            )}
          >
            <span
              className={cn(
                "absolute -left-[25px] top-1 size-2 rounded-full",
                e.border === "red" && "bg-red",
                e.border === "amber" && "bg-amber",
                e.border === "green" && "bg-green",
                e.border === "neutral" && "bg-text-3"
              )}
            />
            <div className="text-[13px] text-text-3">{e.label}</div>
            <div className="text-body text-text-1">{e.detail}</div>
            <div className="text-[12px] text-text-2">{e.level}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-green bg-green-light/40 p-4 text-body text-green">
        First detectable signal: Update 7 (7 months before enforcement)
      </div>
    </div>
  );
}
