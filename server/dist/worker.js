"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bullmq_1 = require("bullmq");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const os_1 = require("os");
const pdf_lib_1 = require("pdf-lib");
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
function resolveCompressionProfile(quality) {
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
function resolveJobName(job) {
    return String(job.id || (0, crypto_1.randomUUID)()).replace(/[^a-zA-Z0-9_-]/g, "_");
}
async function downloadPdf(inputUrl, inputPath) {
    const response = await fetch(inputUrl);
    if (!response.ok) {
        throw new Error(`Failed to download input PDF (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await (0, promises_1.writeFile)(inputPath, buffer);
    return buffer.length;
}
async function compressPdfWithLibrary(inputPath, outputPath, profile) {
    const inputBytes = await Promise.resolve().then(() => __importStar(require("fs/promises"))).then(({ readFile }) => readFile(inputPath));
    const pdfDoc = await pdf_lib_1.PDFDocument.load(inputBytes, {
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
    await (0, promises_1.writeFile)(outputPath, outputBytes);
}
// Create Worker
const compressWorker = new bullmq_1.Worker("compress", async (job) => {
    const { inputUrl, inputFormat, quality } = job.data;
    if (inputFormat.toLowerCase() !== "pdf") {
        throw new Error(`Unsupported format: ${inputFormat}. Only PDF is supported.`);
    }
    const jobName = resolveJobName(job);
    const workspace = path_1.default.join((0, os_1.tmpdir)(), "veloconvert", "compress");
    const inputPath = path_1.default.join(workspace, `${jobName}-input.pdf`);
    const outputPath = path_1.default.join(workspace, `${jobName}-output.pdf`);
    const compressionLevel = resolveCompressionLevel(quality);
    const compressionProfile = resolveCompressionProfile(quality);
    await (0, promises_1.mkdir)(workspace, { recursive: true });
    const inputBytes = await downloadPdf(inputUrl, inputPath);
    try {
        await compressPdfWithLibrary(inputPath, outputPath, compressionProfile);
    }
    finally {
        await (0, promises_1.rm)(inputPath, { force: true });
    }
    const outputStats = await (0, promises_1.stat)(outputPath);
    return {
        success: true,
        outputPath,
        downloadFilename: `compressed-${jobName}.pdf`,
        inputBytes,
        outputBytes: outputStats.size,
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
