"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SortOption = {
  value: string;
  label: string;
};

export function SortBySelect({
  value,
  options,
  queryKey = "sort",
}: {
  value: string;
  options: SortOption[];
  queryKey?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="inline-flex items-center gap-2 text-[12px] text-text-2">
      <span className="font-medium uppercase tracking-wide text-text-3">Sort by</span>
      <select
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          const params = new URLSearchParams(searchParams.toString());
          if (!next) params.delete(queryKey);
          else params.set(queryKey, next);
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
