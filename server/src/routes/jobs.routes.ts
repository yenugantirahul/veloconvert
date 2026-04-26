import express, { Request, Response } from "express";
import { filCompressorQueue } from "../config/upstash";
import { supabase } from "../config/supabase";

const router = express.Router();
const jobsTable = process.env.SUPABASE_JOBS_TABLE || "jobs";

type DownloadJobResult = {
  success?: boolean;
  server?: string;
  task?: string;
  status?: string;
  downloadFilename?: string | null;
};

async function requestIloverPdfToken(publicKey: string): Promise<string> {
  const response = await fetch("https://api.ilovepdf.com/v1/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_key: publicKey }),
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate with iLovePDF (${response.status})`);
  }

  const payload = (await response.json()) as { token?: string };

  if (!payload?.token) {
    throw new Error("Missing token in iLovePDF auth response.");
  }

  return payload.token;
}

function resolveIloverPdfPublicKey(): string {
  const key =
    process.env.ILOVEPDF_PUBLIC_KEY ||
    process.env.ILOVEPDF_PROJECT_PUBLIC_KEY ||
    process.env.ILOVEPDF_API_PUBLIC_KEY ||
    process.env.ILOVEPDF_KEY;

  if (!key) {
    throw new Error(
      "Missing iLovePDF key. Set one of: ILOVEPDF_PUBLIC_KEY, ILOVEPDF_PROJECT_PUBLIC_KEY, ILOVEPDF_API_PUBLIC_KEY, ILOVEPDF_KEY."
    );
  }

  return key.trim();
}

router.post("/create", async (req: Request, res: Response) => {
  try {
    const { uId, inFormat, inUrl, quality } = req.body;

    if (!uId || !inFormat || !inUrl) {
      return res.status(400).json({
        message: "Missing required fields: uId, inFormat, inUrl",
        source: "validation",
      });
    }

    const { data, error } = await supabase
      .from("Job")
      .insert({
        user_id: uId,
        input_url: inUrl,
        input_format: inFormat,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        message: "Failed to insert job row",
        source: "supabase",
        table: jobsTable,
        error: error.message,
      });
    }

    const queueJob = await filCompressorQueue.add("compress", {
      userId: uId,
      inputUrl: inUrl,
      inputFormat: inFormat,
      quality,
    });

    return res.status(201).json({
      message: "Job queued",
      jobId: data?.id || queueJob.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";

    return res.status(500).json({
      message: "Failed to enqueue job",
      source: "queue",
      error: message,
    });
  }
});

router.get("/:jobId/status", async (req: Request, res: Response) => {
  try {
    const rawJobId = req.params.jobId;
    const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;

    if (!jobId) {
      return res.status(400).json({
        message: "Missing jobId",
      });
    }

    const job = await filCompressorQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        jobId,
      });
    }

    const state = await job.getState();
    const result = (job.returnvalue || null) as DownloadJobResult | null;

    return res.status(200).json({
      jobId,
      state,
      result,
      failedReason: job.failedReason || null,
      downloadUrl:
        state === "completed" && result?.server && result?.task
          ? `/api/jobs/${jobId}/download`
          : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return res.status(500).json({
      message: "Failed to fetch job status",
      error: message,
    });
  }
});

router.get("/:jobId/download", async (req: Request, res: Response) => {
  try {
    const rawJobId = req.params.jobId;
    const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;

    if (!jobId) {
      return res.status(400).json({
        message: "Missing jobId",
      });
    }

    const job = await filCompressorQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        jobId,
      });
    }

    const state = await job.getState();
    if (state !== "completed") {
      return res.status(409).json({
        message: "Job is not completed yet",
        state,
      });
    }

    const result = (job.returnvalue || null) as DownloadJobResult | null;
    if (!result?.server || !result?.task) {
      return res.status(500).json({
        message: "Download metadata missing from job result",
      });
    }

    const publicKey = resolveIloverPdfPublicKey();
    const token = await requestIloverPdfToken(publicKey);
    const fileResponse = await fetch(
      `https://${result.server}/v1/download/${result.task}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!fileResponse.ok) {
      return res.status(502).json({
        message: "Failed to fetch file from iLovePDF",
        statusCode: fileResponse.status,
      });
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fallbackFilename = `compressed-${jobId}.pdf`;
    const filename = result.downloadFilename || fallbackFilename;

    res.setHeader(
      "Content-Type",
      fileResponse.headers.get("content-type") || "application/pdf"
    );
    res.setHeader("Content-Length", buffer.length.toString());
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

    return res.status(200).send(buffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return res.status(500).json({
      message: "Failed to download processed file",
      error: message,
    });
  }
});

export default router;
