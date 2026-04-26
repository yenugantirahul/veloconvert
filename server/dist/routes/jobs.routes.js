"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upstash_1 = require("../config/upstash");
const supabase_1 = require("../config/supabase");
const router = express_1.default.Router();
const jobsTable = process.env.SUPABASE_JOBS_TABLE || "jobs";
router.post("/create", async (req, res) => {
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
});
exports.default = router;
