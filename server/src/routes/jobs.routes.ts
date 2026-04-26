import express, { Request, Response } from "express";
import { filCompressorQueue } from "../config/upstash";
import { supabase } from "../config/supabase";
const router = express.Router();
const jobsTable = process.env.SUPABASE_JOBS_TABLE || "jobs";

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

export default router;
