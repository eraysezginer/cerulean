import type { Confidence } from "@/data/flag-types";
import { cn } from "@/lib/utils";

const styles: Record<
  Confidence,
  { bg: string; text: string; label: string }
> = {
  High: { bg: "bg-red-light", text: "text-red", label: "High" },
  Medium: { bg: "bg-amber-light", text: "text-amber", label: "Medium" },
  Low: { bg: "bg-bg-3", text: "text-text-3", label: "Low" },
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const s = styles[level];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium",
        s.bg,
        s.text
      )}
    >
      {s.label}
    </span>
  );
}
