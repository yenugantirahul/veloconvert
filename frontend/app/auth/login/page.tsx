"use client";
import { useState } from "react";

import AuthShell from "@/components/AuthShell";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
      <Suspense fallback={<div>Loading...</div>}>
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
              className="input-class"
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
                className="input-class pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-class">
            Sign In
          </button>
        </form>
      </Suspense>
    </AuthShell>
  );
}
