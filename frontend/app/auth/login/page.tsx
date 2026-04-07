"use client";
import { useState } from "react";

import AuthShell from "@/components/AuthShell";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SignInPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
      router.push("/")
      router.refresh();
    }
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing your conversions, files, and workflow."
      footerText="New to VeloConvert?"
      footerLinkText="Create an account"
      footerLinkHref="/auth/signup"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            type="email"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/7"
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-white/80">
            Password
          </label>
          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              type={showPassword ? "text" : "password"}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/7"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white/80"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="h-12 w-full rounded-2xl bg-linear-to-r from-indigo-500 to-violet-500 text-sm font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-500/20"
        >
          Sign in
        </button>
      </form>
    </AuthShell>
  );
}
