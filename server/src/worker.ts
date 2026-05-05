import "dotenv/config";
import { Job, Worker } from "bullmq";
import { randomUUID } from "crypto";
import { createWriteStream } from "fs";
import { mkdir, rm, stat, writeFile } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable, Transform } from "stream";
import { tmpdir } from "os";
import { PDFDocument } from "pdf-lib";
import { CompressJobType } from "./config/upstash";
import { upstashConnection } from "./config/upstash";

const JOB_FETCH_TIMEOUT_MS = parseInt(process.env.JOB_FETCH_TIMEOUT_MS || "60000", 10);
const MAX_INPUT_BYTES = parseInt(process.env.MAX_INPUT_PDF_BYTES || "52428800", 10); // 50 MB
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || "2", 10);

type CompressionResult = {
  success: boolean;
  outputPath: string;
  downloadFilename: string | null;
  inputBytes: number | null;
  outputBytes: number | null;
  compressionLevel: "low" | "recommended" | "extreme";
};

function resolveCompressionLevel(
  quality?: string,
): "low" | "recommended" | "extreme" {
  switch ((quality || "").toLowerCase()) {
    case "high":
      return "low";
    case "low":
      return "extreme";
    case "medium":
    default:
      return "recommended";
  }
}

type CompressionProfile = {
  saveOptions: {
    useObjectStreams: boolean;
  };
  stripMetadata: boolean;
};

function resolveCompressionProfile(quality?: string): CompressionProfile {
  switch ((quality || "").toLowerCase()) {
    case "high":
      return {
        saveOptions: { useObjectStreams: true },
        stripMetadata: false,
      };
    case "low":
      return {
        saveOptions: { useObjectStreams: true },
        stripMetadata: true,
      };
    case "medium":
    default:
      return {
        saveOptions: { useObjectStreams: true },
        stripMetadata: true,
      };
  }
}

function resolveJobName(job: Job<CompressJobType>): string {
  return String(job.id || randomUUID()).replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function downloadPdf(inputUrl: string, inputPath: string): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), JOB_FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(inputUrl, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Failed to download input PDF (${response.status})`);
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_INPUT_BYTES) {
    throw new Error(
      `Input PDF exceeds maximum allowed size of ${MAX_INPUT_BYTES} bytes`,
    );
  }

  if (!response.body) {
    throw new Error("Response body is empty");
  }

  let bytesWritten = 0;
  const fileStream = createWriteStream(inputPath);

  const sizeGuard = new Transform({
    transform(chunk, _enc, cb) {
      bytesWritten += (chunk as Buffer).length;
      if (bytesWritten > MAX_INPUT_BYTES) {
        cb(
          new Error(
            `Input PDF exceeds maximum allowed size of ${MAX_INPUT_BYTES} bytes`,
          ),
        );
        return;
      }
      cb(null, chunk);
    },
  });

  try {
    await pipeline(
      Readable.fromWeb(response.body as unknown as Parameters<typeof Readable.fromWeb>[0]),
      sizeGuard,
      fileStream,
    );
  } catch (err) {
    await rm(inputPath, { force: true });
    throw err;
  }

  return bytesWritten;
}

async function compressPdfWithLibrary(
  inputPath: string,
  outputPath: string,
  profile: CompressionProfile,
): Promise<void> {
  const inputBytes = await import("fs/promises").then(({ readFile }) =>
    readFile(inputPath),
  );
  const pdfDoc = await PDFDocument.load(inputBytes, {
    updateMetadata: false,
  });

  if (profile.stripMetadata) {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator("");
    pdfDoc.setProducer("");
  }

  const outputBytes = await pdfDoc.save(profile.saveOptions);
  await writeFile(outputPath, outputBytes);
}

// Create Worker
const compressWorker = new Worker(
  "compress",

  async (job: Job<CompressJobType>): Promise<CompressionResult> => {
    const { inputUrl, inputFormat, quality } = job.data;

    if (inputFormat.toLowerCase() !== "pdf") {
      throw new Error(
        `Unsupported format: ${inputFormat}. Only PDF is supported.`,
      );
    }

    const jobName = resolveJobName(job);
    const workspace = path.join(tmpdir(), "veloconvert", "compress");
    const inputPath = path.join(workspace, `${jobName}-input.pdf`);
    const outputPath = path.join(workspace, `${jobName}-output.pdf`);
    const compressionLevel = resolveCompressionLevel(quality);
    const compressionProfile = resolveCompressionProfile(quality);

    await mkdir(workspace, { recursive: true });

    const inputBytes = await downloadPdf(inputUrl, inputPath);

    try {
      await compressPdfWithLibrary(inputPath, outputPath, compressionProfile);
    } finally {
      await rm(inputPath, { force: true });
    }

    const outputStats = await stat(outputPath);

    return {
      success: true,
      outputPath,
      downloadFilename: `compressed-${jobName}.pdf`,
      inputBytes,
      outputBytes: outputStats.size,
      compressionLevel,
    };
  },
  {
    connection: upstashConnection,
    concurrency: WORKER_CONCURRENCY,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400, count: 50 },
  },
);

console.log("Worker initialized for queue: compress");

compressWorker.on("completed", (job: Job<CompressJobType>) => {
  console.log(`✅ Job ${job.id} completed`);
});

compressWorker.on(
  "failed",
  (job: Job<CompressJobType> | undefined, err: Error) => {
    console.log(`❌ Job ${job?.id} failed:`, err.message);
  },
);
