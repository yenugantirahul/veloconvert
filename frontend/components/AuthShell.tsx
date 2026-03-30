"use client";

import Link from "next/link";
import { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-white/10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.25),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_25%)]" />

          <div className="relative flex h-full flex-col justify-between p-10">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold backdrop-blur">
                  V
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight">VeloConvert</p>
                  <p className="text-sm text-white/50">Fast. Clean. Reliable.</p>
                </div>
              </Link>
            </div>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
                Built for creators, teams, and quick file workflows
              </div>

              <h1 className="text-5xl font-semibold leading-tight tracking-tight">
                Convert files with speed, clarity, and zero friction.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-white/65">
                One place to upload, convert, organize, and manage your workflow.
                Designed to feel simple on the surface, powerful underneath.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold">10x</p>
                  <p className="mt-1 text-sm text-white/55">Cleaner flow</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold">Secure</p>
                  <p className="mt-1 text-sm text-white/55">Protected sessions</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold">Smooth</p>
                  <p className="mt-1 text-sm text-white/55">Focused experience</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-white/35">
              © 2026 VeloConvert. Built for fast file conversion workflows.
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%)]" />

          <div className="relative w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 font-semibold">
                  V
                </div>
                <div>
                  <p className="font-semibold">VeloConvert</p>
                  <p className="text-sm text-white/50">Fast. Clean. Reliable.</p>
                </div>
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">{subtitle}</p>
              </div>

              {children}

              <div className="mt-8 text-center text-sm text-white/50">
                {footerText}{" "}
                <Link
                  href={footerLinkHref}
                  className="font-medium text-white transition hover:text-indigo-300"
                >
                  {footerLinkText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}