"use client";

import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useId, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const border = "border-border";
const todayValue = () => format(new Date(), "yyyy-MM-dd");

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
  const setToday = () => {
    onChange(todayValue());
    setOpen(false);
  };

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
            "mt-0.5 flex w-full items-center justify-between gap-2 rounded-xl border bg-bg px-3 text-left text-text-1 outline-none transition-all enabled:hover:border-teal/35 enabled:hover:bg-teal/[0.03] enabled:focus-visible:ring-2 enabled:focus-visible:ring-teal/30",
            isLg ? "h-11 min-h-11 text-[15px]" : "h-9 min-h-9 text-[13px]",
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
          className="w-[min(360px,calc(100vw-1rem))] max-w-[min(100vw-1rem,360px)] overflow-hidden border-border bg-bg p-0 text-text-1 shadow-xl"
          align="start"
        >
          <div className="border-b border-border bg-bg-2 px-3 py-2">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-text-3">
              {label.replace(/\s\*$/, "")}
            </p>
            <p className="mt-0.5 text-[14px] font-medium text-text-1">
              {selected ? format(selected, "EEEE, MMMM d, yyyy") : "Choose a date"}
            </p>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-border px-3 py-2">
            <input
              type="date"
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "h-9 min-w-0 rounded-lg border border-border bg-bg px-2 text-[13px] text-text-1 outline-none focus:ring-2 focus:ring-teal/25",
                error && "border-red"
              )}
            />
            <button
              type="button"
              onClick={setToday}
              className="h-9 rounded-lg border border-border bg-bg px-3 text-[13px] font-medium text-teal hover:border-teal/35 hover:bg-teal/[0.05]"
            >
              Today
            </button>
          </div>
          <div className="p-2">
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
              className="mx-auto text-text-1 [--cell-size:2.35rem]"
              classNames={{
                month_caption: "flex h-9 w-full items-center justify-center px-8",
                dropdowns: "flex h-9 w-full items-center justify-center gap-1.5 text-[13px] font-semibold",
                caption_label: "rounded-md px-2 text-[13px] font-semibold text-text-1",
                weekdays: "mt-1 flex text-text-3",
                weekday: "flex-1 text-center text-[11px] font-medium uppercase tracking-wide text-text-3",
                week: "mt-1 flex w-full",
                day: "group/day relative aspect-square h-full w-full rounded-lg p-0 text-center select-none",
                today: "rounded-lg bg-teal/[0.08] text-teal",
                outside: "text-text-3/45",
              }}
            />
          </div>
          {value.trim() !== "" ? (
            <div className="flex items-center justify-between border-t border-border bg-bg-2 px-3 py-2">
              <span className="text-[12px] text-text-3">Stored as {value}</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-text-2 hover:text-red"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <X className="size-3" aria-hidden />
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
