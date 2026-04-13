"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";
type UploadState = "idle" | "uploading" | "success" | "error";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const API_BASE_PATH = "/api";

export default function UploadPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState("pdf");
  const [status, setStatus] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/login");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm text-zinc-400">Checking session...</p>
        </div>
      </main>
    );
  }

  const validateFile = (selectedFile: File) => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      return "Unsupported file type.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size exceeds 10 MB.";
    }

    return null;
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const error = validateFile(selectedFile);
    if (error) {
      setFile(null);
      setStatus("error");
      setMessage(error);
      return;
    }

    setFile(selectedFile);
    setStatus("idle");
    setMessage("");
    setProgress(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeFile = () => {
    setFile(null);
    setStatus("idle");
    setMessage("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const simulateProgress = () => {
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);

      if (current >= 90) {
        clearInterval(interval);
      }
    }, 200);

    return interval;
  };

  const startPolling = (jobId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`https://veloconvert.onrender.com/api/jobs/${jobId}`, {
        credentials: "include",
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        return;
      }

      const data = await res.json();

      if (data.status === "COMPLETED") {
        clearInterval(interval);
        setDownloadUrl(data.outputUrl);
      }

      if (data.status === "failed") {
        clearInterval(interval);
        alert("Conversion failed");
      }
    }, 3000);
  };
  const handleUpload = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a file first.");
      return;
    }

    setStatus("uploading");
    setMessage("");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetFormat", targetFormat);

    const interval = simulateProgress();

    try {
      const headers: HeadersInit = {
        // Explicitly add auth header if session token is available
        "X-Session-User": session?.user?.id || "",
      };

      const res = await fetch(`https://veloconvert.onrender.com/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers,
      });

      const payload = await res.json().catch(() => null);

      clearInterval(interval);

      if (res.status === 401) {
        throw new Error("Session expired. Please sign in again.");
      }

      if (!res.ok || payload?.success === false) {
        throw new Error(payload?.message || "Upload failed.");
      }

      setProgress(100);
      setStatus("success");
      setMessage(
        payload?.message ||
          "File uploaded successfully. Conversion job created.",
      );

      startPolling(payload.data.job.id);
      console.log(downloadUrl);
    } catch (error) {
      clearInterval(interval);
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      setProgress(0);
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload File</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Upload your file, choose the target format, and start the conversion
            job.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                dragActive
                  ? "border-indigo-400 bg-indigo-500/10"
                  : "border-zinc-700 bg-zinc-950/40"
              }`}
            >
              <div className="mb-4 text-4xl">📁</div>
              <h2 className="text-xl font-semibold">
                Drag & drop your file here
              </h2>
              <p className="mt-2 max-w-md text-sm text-zinc-400">
                Supported: PDF, DOC, DOCX, PNG, JPG, TXT. Maximum file size: 10
                MB.
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 rounded-xl bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
              >
                Browse File
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>

            {file && (
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {file.type || "Unknown type"} •{" "}
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <button
                    onClick={removeFile}
                    className="rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Convert to
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-500"
              >
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="txt">TXT</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>

            {status === "uploading" && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {message && (
              <div
                className={`mt-6 rounded-xl px-4 py-3 text-sm ${
                  status === "success"
                    ? "border border-emerald-700 bg-emerald-500/10 text-emerald-300"
                    : status === "error"
                      ? "border border-red-700 bg-red-500/10 text-red-300"
                      : "border border-zinc-700 bg-zinc-800 text-zinc-300"
                }`}
              >
                {message}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || status === "uploading"}
              className="mt-6 w-full rounded-xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "uploading" ? "Uploading..." : "Upload & Convert"}
            </button>
          </section>

          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg">
            <h2 className="text-xl font-semibold">What happens next?</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="font-medium">1. File upload</p>
                <p className="mt-1 text-sm text-zinc-400">
                  The selected file is uploaded securely to your backend.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="font-medium">2. Cloud storage</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Store the file in Cloudinary or your storage service.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="font-medium">3. Job queue</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Create a conversion job and push it to Redis for processing.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="font-medium">4. Output ready</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Once processing is complete, the converted file will be
                  available for download.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
