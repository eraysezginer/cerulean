"use client";

import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const border = "border-border";

function parseYyyyMmDd(s: string): Date | undefined {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return undefined;
  const d = parseISO(t);
  return isValid(d) ? d : undefined;
}

export function DatePickerField({
  label,
  placeholder = "Select date",
  hint,
  value,
  onChange,
  error,
  size = "default",
  disabled = false,
}: {
  label: string;
  placeholder?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  size?: "default" | "lg";
  disabled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const isLg = size === "lg";
  const selected = parseYyyyMmDd(value);
  const display =
    selected != null
      ? format(selected, "MMM d, yyyy")
      : value.trim() !== ""
        ? value
        : placeholder;
  const showPlaceholder = !selected && !value.trim();

  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "mb-0.5 flex flex-wrap items-baseline gap-1.5 font-medium text-text-1",
          isLg ? "text-[15px]" : "text-[13px]"
        )}
      >
        {label}
        {hint ? (
          <span className={cn("font-normal text-text-3", isLg ? "text-[14px]" : "text-[12px]")}>
            {hint}
          </span>
        ) : null}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          type="button"
          className={cn(
            "mt-0.5 flex w-full items-center justify-between gap-2 rounded-md border bg-bg px-3 text-left text-text-1 outline-none transition-shadow enabled:hover:border-border enabled:focus-visible:ring-2 enabled:focus-visible:ring-teal/30",
            isLg ? "h-9 min-h-9 text-[15px]" : "h-8 min-h-8 text-[13px]",
            `border ${border}`,
            showPlaceholder && "text-text-3",
            error && "border-red",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {showPlaceholder ? <span className="text-text-3">{placeholder}</span> : display}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-teal" aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          className="w-auto max-w-[min(100vw-1rem,340px)] border-border bg-bg p-0 text-text-1 shadow-lg"
          align="start"
        >
          <div className="p-1">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(d) => {
                onChange(d ? format(d, "yyyy-MM-dd") : "");
                setOpen(false);
              }}
              captionLayout="dropdown"
              fromYear={1990}
              toYear={new Date().getFullYear() + 3}
              defaultMonth={selected ?? new Date()}
              className="text-text-1 [--cell-size:2.25rem]"
            />
          </div>
          {value.trim() !== "" ? (
            <div className="border-t border-border px-2 py-1.5">
              <button
                type="button"
                className="text-[12px] font-medium text-text-2 hover:text-text-1 hover:underline"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Clear date
              </button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      {error ? (
        <p className={cn("mt-0.5 text-red", isLg ? "text-[15px]" : "text-[13px]")}>{error}</p>
      ) : null}
    </div>
  );
}
