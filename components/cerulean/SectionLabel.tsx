import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
  withDivider = false,
}: {
  children: React.ReactNode;
  className?: string;
  withDivider?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-section-label uppercase text-text-3",
        withDivider && "border-b border-border pb-2",
        className
      )}
    >
      {children}
    </div>
  );
}
