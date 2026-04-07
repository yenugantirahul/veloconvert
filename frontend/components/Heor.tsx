"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.16),_transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(10,10,15,0.8))]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 md:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium tracking-wide text-white/75 backdrop-blur sm:text-sm">
            Fast file conversion for modern workflows
          </div>

          <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Convert files
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {" "}
              faster
            </span>
            , manage them smarter, and keep your workflow clean.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
            VeloConvert helps you upload, convert, and organize files in one
            smooth experience. Built for speed, clarity, and zero clutter.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 sm:w-auto"
            >
              Get Started
            </Link>

            <Link
              href="/convert"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-white/85 backdrop-blur transition hover:bg-white/10 sm:w-auto"
            >
              Try Conversion
            </Link>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-indigo-400/30 hover:bg-white/10">
            <p className="text-base font-semibold sm:text-lg">Quick Uploads</p>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Simple flow from file selection to conversion.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-indigo-400/30 hover:bg-white/10">
            <p className="text-base font-semibold sm:text-lg">Clean Dashboard</p>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Track and manage all your converted files easily.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-indigo-400/30 hover:bg-white/10 sm:col-span-2 lg:col-span-1">
            <p className="text-base font-semibold sm:text-lg">Reliable Flow</p>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Designed for a smooth and focused user experience.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300/80">
              Features
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Everything you need for smooth file conversion
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Supports multiple file formats for conversion.",
              "Drag-and-drop functionality for quick uploads.",
              "Real-time progress tracking during conversions.",
              "Secure and private file handling.",
              "Optimized for both desktop and mobile devices.",
              "Simple experience with minimal clutter.",
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-violet-400/30 hover:bg-white/10"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-sm font-semibold text-indigo-300">
                  0{index + 1}
                </div>
                <p className="text-sm leading-6 text-white/75">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300/80">
              How It Works
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              From upload to download in a few simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              "Upload your file using the upload button or drag-and-drop area.",
              "Select the output format you want.",
              'Click the "Convert" button to begin processing.',
              "Download the converted file once it is ready.",
              "Manage all your converted files from the dashboard.",
            ].map((step, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <div className="mb-4 text-2xl font-bold text-indigo-300">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-white/70">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}