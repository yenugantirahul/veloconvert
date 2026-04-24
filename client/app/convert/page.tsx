"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConvertPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  if (!isSignedIn) {
    router.push("/auth/login")
  }
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("medium");

  return (
    <div className="min-h-screen bg-[#131315] px-6 py-28 text-[#e5e1e4]">
      <main className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wider text-[#4cd7f6]">
            VELOCONVERT STUDIO
          </p>

          <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">
            Compress Files Faster
          </h1>

          <p className="mt-3 max-w-xl text-sm text-zinc-400">
            Upload a file and reduce its size without losing quality.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#1a1a1d] p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white">Compress File</h2>

          <p className="mt-1 text-sm text-zinc-400">
            Select your file and compression level.
          </p>

          {/* File Upload */}
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) setFile(selectedFile);
            }}
          />

          <label
            htmlFor="file-upload"
            className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#3d494c] bg-[#0e0e10] p-10 text-center transition hover:border-[#4cd7f6]"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#201f22] text-2xl">
              📁
            </div>

            <p className="font-semibold text-white">
              {file ? file.name : "Click to upload file"}
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              PDF, Images, Videos supported
            </p>
          </label>

          {/* Compression Level */}
          <div className="mt-6">
            <label className="mb-2 block text-xs font-semibold text-zinc-400">
              COMPRESSION LEVEL
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setQuality("high")}
                className={`rounded px-4 py-2 text-sm ${
                  quality === "high"
                    ? "bg-[#4cd7f6] text-black"
                    : "bg-[#201f22] text-zinc-300"
                }`}
              >
                High Quality
              </button>

              <button
                onClick={() => setQuality("medium")}
                className={`rounded px-4 py-2 text-sm ${
                  quality === "medium"
                    ? "bg-[#4cd7f6] text-black"
                    : "bg-[#201f22] text-zinc-300"
                }`}
              >
                Balanced
              </button>

              <button
                onClick={() => setQuality("low")}
                className={`rounded px-4 py-2 text-sm ${
                  quality === "low"
                    ? "bg-[#4cd7f6] text-black"
                    : "bg-[#201f22] text-zinc-300"
                }`}
              >
                Small Size
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            disabled={!file}
            className="mt-6 w-full rounded-lg bg-gradient-to-br from-[#4cd7f6] to-[#4edea3] px-6 py-3 text-sm font-semibold text-[#003640] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              console.log("Compressing:", file?.name, "Quality:", quality);
            }}
          >
            Compress Now
          </button>
        </section>
      </main>
    </div>
  );
}
