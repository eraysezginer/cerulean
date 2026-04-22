"use client";

import { Upload } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const border = "border-border";

export function StepHeader({
  step,
  title,
  description,
  color = "teal",
}: {
  step: string;
  title: string;
  description: string;
  color?: "teal" | "purple" | "text-3";
}) {
  const borderC =
    color === "teal"
      ? "border-teal"
      : color === "purple"
        ? "border-purple"
        : "border-text-3/40";
  const circle =
    color === "teal"
      ? "bg-teal/[0.12] text-teal"
      : color === "purple"
        ? "bg-purple/[0.12] text-purple"
        : "bg-bg-3 text-text-3";
  return (
    <div className={cn("mb-4 border-t-[4px] pt-3", borderC)}>
      <div className="flex gap-2">
        {step ? (
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold",
              circle
            )}
          >
            {step}
          </span>
        ) : null}
        <div>
          <h2 className="text-[15px] font-semibold text-text-1">{title}</h2>
          <p className="mt-0.5 text-[13px] font-normal leading-snug text-text-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  placeholder,
  hint,
  value,
  onChange,
  error,
  type = "text",
  size = "default",
}: {
  label: string;
  placeholder?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  size?: "default" | "lg";
}) {
  const isLg = size === "lg";
  return (
    <div>
      <label
        className={cn(
          "mb-0.5 flex flex-wrap items-baseline gap-1.5 font-medium text-text-1",
          isLg ? "text-[15px]" : "text-[13px]"
        )}
      >
        {label}
        {hint ? (
          <span className={cn("font-normal text-text-3", isLg ? "text-[14px]" : "text-[12px]")}>{hint}</span>
        ) : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "mt-0.5 w-full rounded-md border bg-bg px-3 text-text-1 placeholder:text-text-3",
          isLg ? "h-9 text-[15px]" : "h-8 text-[13px]",
          `border ${border} focus:outline-none focus:ring-2 focus:ring-teal/30`,
          error && "border-red"
        )}
      />
      {error ? (
        <p className={cn("mt-0.5 text-red", isLg ? "text-[15px]" : "text-[13px]")}>{error}</p>
      ) : null}
    </div>
  );
}

export function FormTextarea({
  label,
  placeholder,
  rows = 3,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-text-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "mt-0.5 w-full resize-y rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-teal/30"
        )}
      />
    </div>
  );
}

export function TwoColumnRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">{children}</div>;
}

export function MultiSelectChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(o: string) {
    onChange(
      value.includes(o) ? value.filter((x) => x !== o) : [...value, o]
    );
  }
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-text-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className={cn(
                "h-5 rounded-full px-2 text-[12px] font-medium transition-colors",
                on
                  ? "bg-teal-light font-medium text-teal"
                  : "bg-bg-2 text-text-2"
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

export function SelectDropdown({
  label,
  hint,
  options,
  value,
  onChange,
  placeholder,
  size = "default",
}: {
  label: string;
  hint?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  size?: "default" | "lg";
}) {
  const isLg = size === "lg";
  return (
    <div>
      <label
        className={cn(
          "mb-0.5 flex flex-wrap items-baseline gap-1.5 font-medium text-text-1",
          isLg ? "text-[15px]" : "text-[13px]"
        )}
      >
        {label}
        {hint ? (
          <span className={cn("font-normal text-text-3", isLg ? "text-[14px]" : "text-[12px]")}>{hint}</span>
        ) : null}
      </label>
      <div className="relative mt-0.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-md border border-border bg-bg pl-2 pr-8 text-text-1 focus:outline-none focus:ring-2 focus:ring-teal/30",
            isLg ? "h-9 text-[15px]" : "h-8 text-[13px]"
          )}
        >
          {placeholder ? (
            <option value="">{placeholder}</option>
          ) : null}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-3">
          ▾
        </span>
      </div>
    </div>
  );
}

export function NavigationButtons({
  onBack,
  onNext,
  nextLabel,
  showBack = true,
  backLabel = "Back",
  nextWidth,
  isSubmit = false,
  isLoading = false,
  disabled = false,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel: string;
  showBack?: boolean;
  backLabel?: string;
  nextWidth?: number;
  isSubmit?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border/80 pt-6">
      {showBack ? (
        <Button
          type="button"
          onClick={onBack}
          className="h-[34px] w-[88px] rounded-md border-0 bg-bg-3 text-[15px] font-medium text-text-2 hover:bg-bg-3/90"
        >
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      <Button
        type={isSubmit ? "submit" : "button"}
        onClick={!isSubmit ? onNext : undefined}
        disabled={disabled || isLoading}
        style={nextWidth ? { minWidth: nextWidth } : undefined}
        className="h-[34px] rounded-lg bg-teal px-4 text-[15px] font-medium text-primary-foreground hover:bg-teal/90 disabled:opacity-60"
      >
        {isLoading ? "…" : nextLabel}
      </Button>
    </div>
  );
}

export function UploadZone({
  label,
  subtext,
  onFiles,
}: {
  label: string;
  subtext: string;
  onFiles: (files: { name: string; size: number }[]) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-text-1">{label}</p>
      <label
        className="flex h-14 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-teal/30 bg-teal/[0.03] px-2 text-center"
      >
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const list = e.target.files;
            if (!list?.length) return;
            onFiles(
              Array.from(list).map((f) => ({ name: f.name, size: f.size }))
            );
          }}
        />
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-teal">
          <Upload className="h-3.5 w-3.5" />
          Upload or drop files
        </span>
        <span className="mt-0.5 text-[12px] text-text-3">{subtext}</span>
      </label>
    </div>
  );
}

export function IntegrationCard({
  name,
  description,
  buttonLabel,
  buttonVariant,
  connected,
  onAction,
}: {
  name: string;
  description: string;
  buttonLabel: string;
  buttonVariant: "teal" | "amber";
  connected?: boolean;
  onAction?: () => void;
}) {
  const b =
    buttonVariant === "teal"
      ? "bg-teal-light text-teal hover:opacity-90"
      : "bg-amber-light text-amber hover:opacity-90";
  return (
    <div className="mb-2 flex h-[62px] items-center justify-between gap-2 rounded-lg bg-bg-2 px-3">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-text-1">{name}</p>
        <p className="line-clamp-2 text-[12px] text-text-2">{description}</p>
      </div>
      <Button
        type="button"
        onClick={onAction}
        className={cn("h-[26px] shrink-0 rounded-md px-2 text-[12px] font-medium", b)}
      >
        {connected ? "Connected" : buttonLabel}
      </Button>
    </div>
  );
}

export function TaggedTextarea({
  label,
  placeholder,
  rows,
  tag,
  tagColor,
  value,
  onChange,
  size = "default",
}: {
  label: string;
  placeholder: string;
  rows: number;
  tag: string;
  tagColor: "teal" | "red" | "gold" | "purple" | "text-3";
  value: string;
  onChange: (v: string) => void;
  size?: "default" | "lg";
}) {
  const isLg = size === "lg";
  const tagText = isLg ? "text-[13px]" : "text-[11px]";
  const labelText = isLg ? "text-[15px]" : "text-[13px]";
  const tagBg =
    tagColor === "teal"
      ? "bg-teal/[0.1] text-teal"
      : tagColor === "red"
        ? "bg-red/[0.1] text-red"
        : tagColor === "gold"
          ? "bg-gold/[0.1] text-gold"
          : tagColor === "purple"
            ? "bg-purple-light text-purple"
            : "bg-text-3/10 text-text-3";
  return (
    <div>
      <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
        <span className={cn("font-medium text-text-1", labelText)}>{label}</span>
        <span className={cn("rounded-full px-1.5 py-0.5 font-medium", tagText, tagBg)}>
          {tag}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "mt-0.5 w-full resize-y rounded-md border border-border bg-bg px-2 py-1.5 text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-teal/30",
          isLg ? "min-h-[60px] text-[15px]" : "min-h-[54px] text-[13px]"
        )}
      />
    </div>
  );
}

export function StepProgress({ currentStep }: { currentStep: number }) {
  const steps = [
    { n: 1, label: "Identity" },
    { n: 2, label: "Investment" },
    { n: 3, label: "Ingestion" },
    { n: 4, label: "Monitoring" },
    { n: 5, label: "Initial notes" },
  ];
  return (
    <div className="mb-6">
      <div className="flex gap-2">
        {steps.map((s) => {
          const done = currentStep > s.n;
          const cur = currentStep === s.n;
          return (
            <div key={s.n} className="min-w-0 flex-1">
              <div
                className={cn(
                  "h-[3px] rounded-sm",
                  done && "bg-green",
                  cur && "bg-teal",
                  !done && !cur && "bg-text-3/20"
                )}
              />
              <p
                className={cn(
                  "mt-1 text-[11px]",
                  done && "text-green",
                  cur && "font-medium text-teal",
                  !done && !cur && "text-text-3"
                )}
              >
                {s.n} {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AddressDisplay({ address, onCopy }: { address: string; onCopy: () => void }) {
  return (
    <div>
      <label className="text-[13px] font-medium text-text-1">
        Your dedicated forwarding address
      </label>
      <p className="text-[12px] text-text-2">
        Share with your portfolio company or set up a forwarding rule in Gmail/Outlook
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 rounded-md bg-teal-light px-2 py-1.5 font-mono text-[13px] text-teal">
          {address}
        </code>
        <Button
          type="button"
          onClick={onCopy}
          className="h-7 rounded-md border border-border bg-bg px-2 text-[12px] font-medium text-text-2"
        >
          Copy address
        </Button>
      </div>
    </div>
  );
}

export function FrequencyGroup({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "weekly" | "monthly" | "quarterly" | "irregular") => void;
}) {
  const opts: { id: "weekly" | "monthly" | "quarterly" | "irregular"; label: string }[] = [
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "quarterly", label: "Quarterly" },
    { id: "irregular", label: "Irregular" },
  ];
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-text-1">Expected update frequency</p>
      <div className="flex flex-wrap gap-1.5">
        {opts.map((o) => {
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "h-5 rounded-full px-2 text-[12px] font-medium",
                on ? "bg-teal-light font-medium text-teal" : "bg-bg-2 text-text-2"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PriorityGroup({
  value,
  onChange,
}: {
  value: "high" | "standard" | "low";
  onChange: (v: "high" | "standard" | "low") => void;
}) {
  return (
    <div>
      <p className="mb-0.5 text-[13px] font-medium text-text-1">Monitoring priority</p>
      <p className="mb-2 text-[12px] text-text-2">
        Affects convergence threshold — High priority = flags surface with fewer corroborating
        signals required
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(
          [
            {
              id: "high" as const,
              t: "High",
              c: "text-red",
              d: "Struggling company — lower threshold",
              br: "border-t-red",
            },
            {
              id: "standard" as const,
              t: "Standard",
              c: "text-teal",
              d: "Normal monitoring",
              br: "border-t-teal",
            },
            {
              id: "low" as const,
              t: "Low",
              c: "text-green",
              d: "Healthy company — fewer alerts",
              br: "border-t-green",
            },
          ] as const
        ).map((p) => {
          const on = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={cn(
                "rounded-lg p-2 text-left transition-colors",
                on ? cn("border-t-[3px] bg-teal-light", p.br) : "border-t-[3px] border-t-transparent bg-bg-2"
              )}
            >
              <p className={cn("text-[14px] font-semibold", p.c)}>{p.t}</p>
              <p className="text-[12px] text-text-2">{p.d}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AlertCheckboxes({
  email,
  slack,
  mobile,
  onChange,
}: {
  email: boolean;
  slack: boolean;
  mobile: boolean;
  onChange: (p: { email?: boolean; slack?: boolean; mobile?: boolean }) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-text-1">Alert delivery for this company</p>
      <ul className="space-y-1.5 text-[13px] text-text-1">
        <li className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border border-border"
            checked={email}
            onChange={(e) => onChange({ email: e.target.checked })}
          />
          Email digest only (Monday morning)
        </li>
        <li className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border border-border"
            checked={slack}
            onChange={(e) => onChange({ slack: e.target.checked })}
          />
          Immediate Slack alert for High confidence flags
        </li>
        <li className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border border-border"
            checked={mobile}
            onChange={(e) => onChange({ mobile: e.target.checked })}
          />
          Mobile push for High confidence only
        </li>
      </ul>
    </div>
  );
}
