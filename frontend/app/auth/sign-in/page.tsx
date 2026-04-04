"use client";
import { useState } from "react";

import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { authClient } from "../../lib/auth-client";
export default function SignInPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassowrd] = useState<string>("");
  const searchParams = useSearchParams();
   const callbackUrl = searchParams.get("callbackUrl") || "/";

  const router = useRouter();
   async function handleSubmit(e: React.FormEvent) {

      e.preventDefault();
  
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
  
      if (error) {
        return;
      }
  
      router.push(callbackUrl);
      router.refresh();
    }
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing your conversions, files, and workflow."
      footerText="New to VeloConvert?"
      footerLinkText="Create an account"
      footerLinkHref="/auth/sign-up"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/7"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-white/80"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-white/50 transition hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>

          <input
            id="password"
            onChange={(e) => setPassowrd(e.target.value)}
            type="password"
            placeholder="Enter your password"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/7"
          />
        </div>

        <button
          type="submit"
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/20"
        >
          Sign in
        </button>

        <div className="relative py-1 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
