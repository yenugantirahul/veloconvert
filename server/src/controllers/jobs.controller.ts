import { Request, Response } from "express";
import { supabase } from "../config/supabase";
const jobsTable = process.env.SUPABASE_JOBS_TABLE || "jobs";
import { filCompressorQueue } from "../config/upstash";
import { readFile, rm } from "fs/promises";

type DownloadJobResult = {
  success?: boolean;
  outputPath?: string;
  downloadFilename?: string | null;
  inputBytes?: number | null;
  outputBytes?: number | null;
  compressionLevel?: "low" | "recommended" | "extreme";
};

export const createJob = async (req: Request, res: Response) => {
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
};

export const getJobStatus = async (req: Request, res: Response) => {
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
        state === "completed" && result?.outputPath
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
};

export const download = async (req: Request, res: Response) => {
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
    if (!result?.outputPath) {
      return res.status(500).json({
        message: "Download metadata missing from job result",
      });
    }

    const buffer = await readFile(result.outputPath);

    const fallbackFilename = `compressed-${jobId}.pdf`;
    const filename = result.downloadFilename || fallbackFilename;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", buffer.length.toString());
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"${filename}\"`,
    );

    const response = res.status(200).send(buffer);

    rm(result.outputPath, { force: true }).catch(() => undefined);

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return res.status(500).json({
      message: "Failed to download processed file",
      error: message,
    });
  }
};
