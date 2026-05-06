"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type DirectionOption = {
  value: "desc" | "asc";
  label: string;
};

const DEFAULT_OPTIONS: DirectionOption[] = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

export function SortDirectionSelect({
  value,
  queryKey = "dir",
  options = DEFAULT_OPTIONS,
}: {
  value: "desc" | "asc";
  queryKey?: string;
  options?: DirectionOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="inline-flex items-center gap-2 text-[12px] text-text-2">
      <span className="font-medium uppercase tracking-wide text-text-3">Direction</span>
      <select
        value={value}
        onChange={(e) => {
          const next = e.target.value as "desc" | "asc";
          const params = new URLSearchParams(searchParams.toString());
          params.set(queryKey, next);
          const q = params.toString();
          router.replace(q ? `${pathname}?${q}` : pathname);
        }}
        className="h-8 rounded-md border border-border bg-bg px-2 text-[13px] text-text-1 focus:outline-none focus:ring-2 focus:ring-teal/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
