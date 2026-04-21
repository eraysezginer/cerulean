"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 350);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="you@firm.com"
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
          placeholder="••••••••"
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
