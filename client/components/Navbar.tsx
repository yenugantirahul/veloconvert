"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 md:px-10 lg:px-16">
        <div className="flex items-center gap-1 font-brand text-xl font-bold text-white">
          <Link href={"/"} onClick={closeMenu}>⚡ VeloConvert</Link>
        </div>

        <nav className="hidden gap-4 text-sm text-zinc-400 md:flex lg:gap-6">
          <Link href="#features" className="hover:text-white">
            Features
          </Link>
          <Link href="/convert" className="hover:text-white">
            Convert
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex lg:gap-4">
          {isSignedIn ? (
            <>
              <h1 className="max-w-50 truncate text-sm hover:text-[#4cd7f6]">
                Hey {user?.firstName || "there"} 👋
              </h1>
              <button
                onClick={() => signOut()}
                className="rounded bg-linear-to-br cursor-pointer from-[#4cd7f6] to-[#4edea3] px-4 py-2 text-sm font-semibold text-[#003640] lg:px-5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-[#4cd7f6] hover:text-[#4cd7f6] lg:px-5"
              >
                Login
              </Link>

              <Link
                href="/auth/signup"
                className="rounded bg-linear-to-br from-[#4cd7f6] to-[#4edea3] px-4 py-2 text-sm font-semibold text-[#003640] transition-opacity hover:opacity-90 lg:px-5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex items-center rounded border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-200 md:hidden"
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-zinc-950/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-zinc-300">
            <Link href="#features" onClick={closeMenu} className="rounded px-2 py-2 hover:bg-white/5">
              Features
            </Link>
            <Link href="/convert" onClick={closeMenu} className="rounded px-2 py-2 hover:bg-white/5">
              Convert
            </Link>
          </nav>

          <div className="mt-4 flex flex-col gap-3">
            {isSignedIn ? (
              <>
                <p className="px-2 text-sm text-zinc-300">Hey {user?.firstName || "there"} 👋</p>
                <button
                  onClick={() => {
                    closeMenu();
                    signOut();
                  }}
                  className="rounded bg-linear-to-br from-[#4cd7f6] to-[#4edea3] px-4 py-2 text-sm font-semibold text-[#003640]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="rounded border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition-all duration-200 hover:border-[#4cd7f6] hover:text-[#4cd7f6]"
                >
                  Login
                </Link>

                <Link
                  href="/auth/signup"
                  onClick={closeMenu}
                  className="rounded bg-linear-to-br from-[#4cd7f6] to-[#4edea3] px-4 py-2 text-sm font-semibold text-[#003640] transition-opacity hover:opacity-90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
