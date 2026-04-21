import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const accentIcon: Record<
  "teal" | "amber" | "rose" | "slate",
  string
> = {
  teal: "bg-teal-light text-teal ring-1 ring-teal/25",
  amber: "bg-amber-light text-amber ring-1 ring-amber/25",
  rose: "bg-red-light text-red ring-1 ring-red/20",
  slate: "bg-bg-3 text-text-2 ring-1 ring-border/80",
};

export function StatCard({
  label,
  value,
  className,
  icon,
  hint,
  accent = "teal",
}: {
  label: string;
  value: string | number;
  className?: string;
  /** When set, shows a richer card layout with icon tile */
  icon?: ReactNode;
  hint?: string;
  accent?: keyof typeof accentIcon;
}) {
  const hasIcon = icon != null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-bg via-bg to-bg-2/90 p-4 shadow-sm ring-1 ring-black/[0.03] transition-all duration-200",
        "hover:border-teal/25 hover:shadow-md",
        hasIcon && "min-h-[104px]",
        className
      )}
    >
      {hasIcon ? (
        <div className="relative flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
            {label}
          </p>
          <div className="flex min-h-[2.75rem] items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm [&_svg]:size-5",
                accentIcon[accent]
              )}
            >
              {icon}
            </div>
            <p className="min-w-0 text-3xl font-semibold leading-none tabular-nums tracking-tight text-text-1">
              {value}
            </p>
          </div>
          {hint ? (
            <p className="text-[12px] leading-snug text-text-2">{hint}</p>
          ) : null}
        </div>
      ) : (
        <div className="relative flex min-h-[72px] flex-col justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
            {label}
          </span>
          <span className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-text-1">
            {value}
          </span>
          {hint ? (
            <span className="mt-1.5 text-[12px] text-text-2">{hint}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
