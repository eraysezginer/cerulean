import { LoginForm } from "@/components/cerulean/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-2">
      <header className="flex h-[44px] shrink-0 items-center border-b border-border bg-bg px-6">
        <span className="text-[15px] font-semibold text-teal">Cerulean</span>
        <span className="ml-2 text-[13px] text-text-3">Standard — Investor</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px] rounded-xl border border-border bg-bg p-8 shadow-sm">
          <div className="mb-6 text-center">
            <p className="mb-2 text-section-label uppercase text-text-3">
              Investor access
            </p>
            <h1 className="text-page-title text-text-1">Sign in</h1>
            <p className="mt-1 text-body text-text-2">
              Use your firm credentials. Sessions are private to your tenant.
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 rounded-lg bg-bg-2 px-3 py-2 text-center">
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
