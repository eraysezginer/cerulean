"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clearDemoSession, getDemoSessionEmail } from "@/lib/demo-auth";
import { cn } from "@/lib/utils";

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const parts = local.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (
      (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    );
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

function UserMenu({
  email,
  onSignOut,
}: {
  email: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = initialsFromEmail(email);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex max-w-[min(100vw-2rem,280px)] items-center gap-2 rounded-full border border-border/80 bg-bg py-1 pl-1 pr-2.5 shadow-sm transition-colors",
          "hover:border-teal/25 hover:bg-teal-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30",
          open && "border-teal/30 bg-teal-light/50"
        )}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal/85 text-[11px] font-semibold text-white shadow-sm"
          aria-hidden
        >
          {initials}
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium text-text-1">
          {email}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-text-3 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-[60] min-w-[240px] overflow-hidden rounded-xl border border-border bg-bg py-1 shadow-lg shadow-black/[0.06] ring-1 ring-black/[0.03]"
        >
          <div className="border-b border-border/80 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-3">
              Signed in as
            </p>
            <p className="mt-0.5 break-all text-[13px] font-medium text-text-1">
              {email}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[14px] text-text-2 transition-colors hover:bg-bg-2 hover:text-text-1"
          >
            <LogOut className="h-4 w-4 shrink-0 opacity-70" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function TopBar({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setEmail(getDemoSessionEmail());

    function sync() {
      setEmail(getDemoSessionEmail());
    }

    window.addEventListener("storage", sync);
    window.addEventListener("cerulean-demo-session", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cerulean-demo-session", sync);
    };
  }, []);

  function signOut() {
    clearDemoSession();
    setEmail(null);
    window.dispatchEvent(new Event("cerulean-demo-session"));
    router.push("/login");
  }

  const signedIn = email !== undefined && email !== null;

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex items-center gap-4 border-b border-border bg-bg/90 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75",
        compact ? "h-11" : "h-14"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          href="/dashboard"
          className="group flex shrink-0 items-center gap-2 rounded-lg pr-1 transition-opacity hover:opacity-90"
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-teal/80 text-white shadow-sm ring-1 ring-teal/20",
              compact ? "h-7 w-7" : "h-8 w-8"
            )}
          >
            <Sparkles
              className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
              strokeWidth={2}
            />
          </span>
          <span className="min-w-0 sm:hidden">
            <span className="block truncate text-[15px] font-semibold leading-tight text-teal">
              Cerulean
            </span>
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block text-top-brand text-teal">Cerulean</span>
            <span className="block text-[12px] leading-tight text-text-3">
              Investor workspace
            </span>
          </span>
        </Link>

        <span
          className="hidden h-6 w-px shrink-0 bg-border md:block"
          aria-hidden
        />

        <span className="hidden items-center gap-2 md:flex">
          <span className="rounded-md border border-border/90 bg-bg-2 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-text-2">
            Standard
          </span>
          <span className="text-[13px] text-text-3">Investor</span>
        </span>
      </div>

      <div className="flex shrink-0 items-center justify-end">
        {email === undefined ? (
          <span
            className={cn(
              "w-[200px] max-w-[50vw] animate-pulse rounded-full bg-bg-2",
              compact ? "h-8" : "h-10"
            )}
            aria-hidden
          />
        ) : signedIn ? (
          <UserMenu email={email} onSignOut={signOut} />
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-teal/20 bg-teal px-4 py-2 text-[14px] font-semibold text-white shadow-sm transition hover:bg-teal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
