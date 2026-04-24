"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-16">
        <div className="flex items-center gap-1 font-brand text-xl font-bold text-white">
          <Link href={"/"}>⚡ VeloConvert</Link>
        </div>

        <nav className="hidden gap-6 text-sm text-zinc-400 md:flex">
          <Link href="#features" className="hover:text-white">
            Features
          </Link>
          <Link href="/convert" className="hover:text-white">
            Convert
          </Link>
        </nav>

        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <h1 className="text-sm hover:text-[#4cd7f6]">Hey {user.firstName} 👋</h1>
            <button
              onClick={() => signOut()}
              className="rounded bg-gradient-to-br from-[#4cd7f6] to-[#4edea3] px-5 py-2 text-sm font-semibold text-[#003640]"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="rounded border border-white/10 px-5 py-2 text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-[#4cd7f6] hover:text-[#4cd7f6]"
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="rounded bg-gradient-to-br from-[#4cd7f6] to-[#4edea3] px-5 py-2 text-sm font-semibold text-[#003640] transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
