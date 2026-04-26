"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ConvertPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("medium");
  const [loading, setLoading] = useState(false);
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const error = (msg: string) => toast.error(msg);
  const success = (msg: string) => toast.success(msg);

  // 🔐 Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth/login");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return null;
  if (!isSignedIn) return null;
  async function createJob(
    inputUrl: string,
    inputFormat: string,
    userId: string,
    compressionQuality: string,
  ) {
    const token = await getToken();

    if (!token) {
      throw new Error("Failed to get auth token. Please sign in again.");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobs/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inUrl: inputUrl,
          inFormat: inputFormat,
          uId: userId,
          quality: compressionQuality,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      const details = [data?.message, data?.source, data?.error]
        .filter(Boolean)
        .join(" | ");
      throw new Error(details || "Error at job creation");
    }

    return data.jobId;
  }

  // 🚀 Upload function
  async function uploadToCloudinary(file: File) {
    if (!file) {
      error("Please upload a file");
      return;
    }

    // ✅ Validate PDF
    if (file.type !== "application/pdf") {
      error("Only PDF files are allowed");
      return;
    }

    // ✅ Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      error("File size must be less than 10MB");
      return;
    }

    try {
      if (!cloudinaryCloudName) {
        throw new Error(
          "Cloudinary config missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
        );
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "nmsmkgj4"); // your preset

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error("Upload response missing file URL");
      }

      if (!user?.id) {
        throw new Error("User not available. Please sign in again.");
      }

      const jobId = await createJob(data.secure_url, "pdf", user.id, quality);

      success(`File uploaded and job queued: ${jobId}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      error(message);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 Connect to backend

  return (
    <div className="min-h-screen bg-[#131315] px-6 py-28 text-[#e5e1e4]">
      <Toaster />

      <main className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wider text-[#4cd7f6]">
            VELOCONVERT STUDIO
          </p>

          <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">
            Compress PDF Files
          </h1>

          <p className="mt-3 max-w-xl text-sm text-zinc-400">
            Upload a PDF and reduce its size instantly.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#1a1a1d] p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white">Compress File</h2>

          <p className="mt-1 text-sm text-zinc-400">
            Select your PDF and compression level.
          </p>

          {/* File Input */}
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
            }}
          />

          <label
            htmlFor="file-upload"
            className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#3d494c] bg-[#0e0e10] p-10 text-center transition hover:border-[#4cd7f6]"
          >
            <div className="mb-4 text-2xl">📁</div>

            <p className="font-semibold text-white">
              {file ? file.name : "Click to upload PDF"}
            </p>

            <p className="mt-2 text-sm text-zinc-400">Only PDF files allowed</p>
          </label>

          {/* Compression Levels */}
          <div className="mt-6">
            <label className="mb-2 block text-xs font-semibold text-zinc-400">
              COMPRESSION LEVEL
            </label>

            <div className="flex gap-2">
              {["high", "medium", "low"].map((level) => (
                <button
                  key={level}
                  onClick={() => setQuality(level)}
                  className={`rounded px-4 py-2 text-sm ${
                    quality === level
                      ? "bg-[#4cd7f6] text-black"
                      : "bg-[#201f22] text-zinc-300"
                  }`}
                >
                  {level === "high"
                    ? "High Quality"
                    : level === "medium"
                      ? "Balanced"
                      : "Small Size"}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={!file || loading}
            onClick={() => file && uploadToCloudinary(file)}
            className="mt-6 w-full cursor-pointer rounded-lg bg-gradient-to-br from-[#4cd7f6] to-[#4edea3] px-6 py-3 text-sm font-semibold text-[#003640] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Compress Now"}
          </button>
        </section>
      </main>
    </div>
  );
}
