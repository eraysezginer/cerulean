export function NavGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/80 py-3 first:pt-1 last:border-b-0">
      <div className="mb-2 px-3 text-section-label uppercase text-text-3">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
