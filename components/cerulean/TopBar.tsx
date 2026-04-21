import Link from "next/link";

export function TopBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-[44px] items-center border-b border-border bg-bg px-4">
      <span className="text-top-brand text-teal">Cerulean</span>
      <span className="ml-2 text-top-tier text-text-3">
        Standard — Investor
      </span>
      <Link
        href="/login"
        className="ml-auto text-[14px] font-medium text-teal hover:underline"
      >
        Sign in
      </Link>
    </header>
  );
}
