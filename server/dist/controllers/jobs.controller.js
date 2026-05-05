"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = exports.getJobStatus = exports.createJob = void 0;
const supabase_1 = require("../config/supabase");
const jobsTable = process.env.SUPABASE_JOBS_TABLE || "jobs";
const upstash_1 = require("../config/upstash");
const promises_1 = require("fs/promises");
const createJob = async (req, res) => {
    try {
        const { uId, inFormat, inUrl, quality } = req.body;
        if (!uId || !inFormat || !inUrl) {
            return res.status(400).json({
                message: "Missing required fields: uId, inFormat, inUrl",
                source: "validation",
            });
        }
        const { data, error } = await supabase_1.supabase
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
        const queueJob = await upstash_1.filCompressorQueue.add("compress", {
            userId: uId,
            inputUrl: inUrl,
            inputFormat: inFormat,
            quality,
        }, {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: { age: 3600 },
            removeOnFail: { age: 86400, count: 50 },
        });
        return res.status(201).json({
            message: "Job queued",
            jobId: data?.id || queueJob.id,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown server error";
        return res.status(500).json({
            message: "Failed to enqueue job",
            source: "queue",
            error: message,
        });
    }
};
exports.createJob = createJob;
const getJobStatus = async (req, res) => {
    try {
        const rawJobId = req.params.jobId;
        const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
        if (!jobId) {
            return res.status(400).json({
                message: "Missing jobId",
            });
        }
        const job = await upstash_1.filCompressorQueue.getJob(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                jobId,
            });
        }
        const state = await job.getState();
        const result = (job.returnvalue || null);
        return res.status(200).json({
            jobId,
            state,
            result,
            failedReason: job.failedReason || null,
            downloadUrl: state === "completed" && result?.outputPath
                ? `/api/jobs/${jobId}/download`
                : null,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown server error";
        return res.status(500).json({
            message: "Failed to fetch job status",
            error: message,
        });
    }
};
exports.getJobStatus = getJobStatus;
const download = async (req, res) => {
    try {
        const rawJobId = req.params.jobId;
        const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
        if (!jobId) {
            return res.status(400).json({
                message: "Missing jobId",
            });
        }
        const job = await upstash_1.filCompressorQueue.getJob(jobId);
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
        const result = (job.returnvalue || null);
        if (!result?.outputPath) {
            return res.status(500).json({
                message: "Download metadata missing from job result",
            });
        }
        const buffer = await (0, promises_1.readFile)(result.outputPath);
        const fallbackFilename = `compressed-${jobId}.pdf`;
        const filename = result.downloadFilename || fallbackFilename;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Length", buffer.length.toString());
        res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
        const response = res.status(200).send(buffer);
        (0, promises_1.rm)(result.outputPath, { force: true }).catch(() => undefined);
        return response;
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown server error";
        return res.status(500).json({
            message: "Failed to download processed file",
            error: message,
        });
    }
};
exports.download = download;
