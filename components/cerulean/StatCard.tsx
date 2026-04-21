import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-[60px] flex-col justify-center rounded-lg bg-bg-2 px-4",
        className
      )}
    >
      <span className="text-[12px] uppercase tracking-wide text-text-3">
        {label}
      </span>
      <span className="text-page-title text-text-1">{value}</span>
    </div>
  );
}
