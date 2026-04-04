"use client";

import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { authClient } from "../../lib/auth-client";
export default function SignUpPage() {
  const searchParams = useSearchParams();
   const callbackUrl = searchParams.get("callbackUrl") || "/";
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassowrd] = useState<string>("");
  const [name, setName] = useState<string>("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = await authClient.signUp.email({
      email,
      password,
      name
    });

    if (error) {
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Get started with a fast, secure workspace for your conversion flow."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/auth/sign-in"
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
            id="email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/7"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Name
          </label>
          <input
            id="name"
            type="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="Rahul"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/7"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-white/80"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            onChange={(e) => setPassowrd(e.target.value)}
            placeholder="Create a strong password"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/7"
          />
        </div>

        <button
          type="submit"
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/20"
        >
          Create account
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
