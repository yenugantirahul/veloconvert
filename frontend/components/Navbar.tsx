"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { authClient } from "../app/lib/auth-client";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-12">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
            V
          </div>
          <div>
            <p className="text-base font-semibold text-white">
              VeloConvert
            </p>
            <p className="text-xs text-white/45">Fast. Clean. Reliable.</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm text-white/75 hover:text-white">
            Home
          </Link>
          <Link href="/convert" className="text-sm text-white/75 hover:text-white">
            Convert
          </Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isPending ? null : session ? (
            <>
              <span className="text-sm text-white/85">
                Hello, {session.user.name}
              </span>

              <button
                onClick={() => authClient.signOut()}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Sign In
              </Link>

              <Link
                href="/auth/sign-up"
                className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#0a0a0f] md:hidden">
          <div className="flex flex-col gap-4 px-4 py-4">

            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/features" onClick={() => setOpen(false)}>Features</Link>
            <Link href="/convert" onClick={() => setOpen(false)}>Convert</Link>

            <div className="mt-2 flex flex-col gap-3">
              {isPending ? null : session ? (
                <>
                  <span>Hello, {session.user.name}</span>

                  <button
                    onClick={() => {
                      authClient.signOut();
                      setOpen(false);
                    }}
                    className="rounded-xl border border-white/10 px-4 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
                    Sign In
                  </Link>

                  <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}