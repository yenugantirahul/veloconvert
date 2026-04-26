"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bullmq_1 = require("bullmq");
const upstash_1 = require("./config/upstash");
// Create Worker
const compressWorker = new bullmq_1.Worker("compress", async (job) => {
    console.log("File compressed download the output");
    return { success: true };
}, {
    connection: upstash_1.upstashConnection,
    concurrency: 5,
});
compressWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});
compressWorker.on("failed", (job, err) => {
    console.log(`❌ Job ${job?.id} failed:`, err.message);
});
