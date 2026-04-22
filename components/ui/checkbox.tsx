"use client";

import { Checkbox } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function CheckboxShad({
  id,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Checkbox.Root
      id={id}
      checked={checked}
      onCheckedChange={(c) => onCheckedChange(!!c)}
      disabled={disabled}
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-bg",
        "data-[checked]:border-teal data-[checked]:bg-teal",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <Checkbox.Indicator className="flex h-full w-full items-center justify-center text-primary-foreground">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}
