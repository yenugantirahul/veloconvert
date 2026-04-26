"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bullmq_1 = require("bullmq");
const upstash_1 = require("./config/upstash");
function resolveCompressionLevel(quality) {
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
function resolveIlovePdfPublicKey() {
    const key = process.env.ILOVEPDF_PUBLIC_KEY ||
        process.env.ILOVEPDF_PROJECT_PUBLIC_KEY ||
        process.env.ILOVEPDF_API_PUBLIC_KEY ||
        process.env.ILOVEPDF_KEY;
    if (!key) {
        throw new Error("Missing iLovePDF key. Set one of: ILOVEPDF_PUBLIC_KEY, ILOVEPDF_PROJECT_PUBLIC_KEY, ILOVEPDF_API_PUBLIC_KEY, ILOVEPDF_KEY.");
    }
    const normalized = key.trim();
    if (normalized.toLowerCase().startsWith("secret_key_")) {
        throw new Error("ILOVEPDF_PUBLIC_KEY is using a secret key value. Use the iLovePDF Project Public Key for /v1/auth.");
    }
    return normalized;
}
async function requestJson(url, init, fallbackError) {
    const response = await fetch(url, init);
    const text = await response.text();
    let payload = null;
    if (text) {
        try {
            payload = JSON.parse(text);
        }
        catch {
            payload = null;
        }
    }
    if (!response.ok) {
        const msg = payload?.message ||
            payload?.error?.message ||
            payload?.type ||
            payload?.error?.type ||
            payload?.param ||
            `${fallbackError} (${response.status})`;
        throw new Error(msg);
    }
    return payload;
}
async function getIloverPdfToken(publicKey) {
    const payload = await requestJson("https://api.ilovepdf.com/v1/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_key: publicKey }),
    }, "Failed to authenticate with iLovePDF");
    return payload.token;
}
// Create Worker
const compressWorker = new bullmq_1.Worker("compress", async (job) => {
    const { inputUrl, inputFormat, quality } = job.data;
    if (inputFormat.toLowerCase() !== "pdf") {
        throw new Error(`Unsupported format: ${inputFormat}. Only PDF is supported.`);
    }
    const publicKey = resolveIlovePdfPublicKey();
    const token = await getIloverPdfToken(publicKey);
    const start = await requestJson("https://api.ilovepdf.com/v1/start/compress", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    }, "Failed to start iLovePDF compression task");
    const upload = await requestJson(`https://${start.server}/v1/upload`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            task: start.task,
            cloud_file: inputUrl,
        }),
    }, "Failed to upload source file to iLovePDF");
    const compressionLevel = resolveCompressionLevel(quality);
    const processResult = await requestJson(`https://${start.server}/v1/process`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            task: start.task,
            tool: "compress",
            files: [
                {
                    server_filename: upload.server_filename,
                    filename: upload.filename || "input.pdf",
                },
            ],
            compression_level: compressionLevel,
        }),
    }, "Failed to process compression task with iLovePDF");
    return {
        success: processResult.status === "TaskSuccess" || processResult.status === "TaskSuccessWithWarnings",
        server: start.server,
        task: start.task,
        status: processResult.status,
        downloadFilename: processResult.download_filename ?? null,
        inputBytes: processResult.filesize ?? null,
        outputBytes: processResult.output_filesize ?? null,
        compressionLevel,
    };
}, {
    connection: upstash_1.upstashConnection,
    concurrency: 5,
});
console.log("Worker initialized for queue: compress");
compressWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});
compressWorker.on("failed", (job, err) => {
    console.log(`❌ Job ${job?.id} failed:`, err.message);
});
