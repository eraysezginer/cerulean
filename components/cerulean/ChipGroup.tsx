"use client";

import { cn } from "@/lib/utils";

export function ChipGroup({
  label,
  hint,
  options,
  value,
  onChange,
  size = "default",
}: {
  label: string;
  hint?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  size?: "default" | "lg";
}) {
  const isLg = size === "lg";
  return (
    <div>
      <p
        className={cn(
          "mb-0.5 font-medium text-text-1",
          isLg ? "text-[15px]" : "text-[13px]"
        )}
      >
        {label}
        {hint ? (
          <span className={cn("ml-1 font-normal text-text-3", isLg ? "text-[14px]" : "text-[12px]")}>
            {hint}
          </span>
        ) : null}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className={cn(
                "rounded-full px-2 font-medium transition-colors",
                isLg ? "h-6 text-[14px]" : "h-5 text-[12px]",
                on ? "bg-teal-light font-medium text-teal" : "bg-bg-2 text-text-2"
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
