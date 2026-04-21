"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isDemoLoginValid } from "@/lib/demo-auth";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    if (!isDemoLoginValid(email, password)) {
      setError("Invalid email or password.");
      return;
    }

    setPending(true);
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 350);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md border border-red/30 bg-red-light/50 px-3 py-2 text-body text-red">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-body text-text-2">
          Work email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@demo.com"
          className="h-10 border-border bg-bg text-body text-text-1 placeholder:text-text-3"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password" className="text-body text-text-2">
            Password
          </Label>
          <button
            type="button"
            className="text-[12px] text-teal hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            Forgot password
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••"
          className="h-10 border-border bg-bg text-body text-text-1 placeholder:text-text-3"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-full bg-teal text-[15px] font-semibold text-primary-foreground hover:bg-teal/90 disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
