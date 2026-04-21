import { Sparkles } from "lucide-react";
import { LoginForm } from "@/components/cerulean/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-bg-2 via-bg-2 to-bg">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(11,114,117,0.12),transparent)]"
        aria-hidden
      />

      <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg/90 px-5 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-teal/80 text-white shadow-sm ring-1 ring-teal/20">
          <Sparkles className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <span className="block text-[15px] font-semibold leading-tight text-teal">
            Cerulean
          </span>
          <span className="text-[12px] text-text-3">Investor workspace</span>
        </div>
        <span className="ml-auto hidden rounded-md border border-border/90 bg-bg-2 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-text-2 sm:inline">
          Standard
        </span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] rounded-2xl border border-border/80 bg-bg p-8 shadow-lg shadow-black/[0.06] ring-1 ring-black/[0.04]">
          <div className="mb-6 text-center">
            <p className="mb-2 text-section-label uppercase text-text-3">
              Investor access
            </p>
            <h1 className="text-page-title text-text-1">Sign in</h1>
            <p className="mt-1 text-body text-text-2">
              Demo: use the credentials below. Sessions are private to your
              tenant.
            </p>
            <p className="mt-4 rounded-lg border border-border/80 bg-bg-2 px-3 py-2.5 font-mono text-[12px] text-text-2">
              admin@demo.com · 123456
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 rounded-xl bg-bg-2/80 px-3 py-2.5 text-center ring-1 ring-border/60">
            <p className="text-[12px] text-text-3">
              Private · never shared — same policy as My Notes.
            </p>
          </div>
        </div>

        <p className="mt-8 max-w-md text-center text-[12px] text-text-3">
          Need access? Your fund administrator can provision an account.
        </p>
      </div>
    </div>
  );
}
