import { Worker } from "bullmq";
import { prisma } from "../lib/prisma.js";
import { bullMqConnection } from "../config/upstash.js";
console.log("Loading conversion worker...");
export const filConversionWorkr = new Worker("convert", async (job) => {
    const { jobId, inputUrl, outputFormat, inputFormat } = job.data;
    console.log(`Worker picked up job ${jobId}`);
    await prisma.job.update({
        where: { id: jobId },
        data: { status: "PROCESSING", errorMessage: null },
    });
    console.log(`Job ${jobId} marked as PROCESSING`);
    try {
        // TODO: Replace this with actual conversion logic.
        // const result = await convertapi.convert(outputFormat, {
        //   File: "https://res.cloudinary.com/.../file.pdf",
        // });
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "COMPLETED",
                outputUrl: inputUrl,
            },
        });
        console.log(`Job ${jobId} marked as COMPLETED`);
    }
    catch (error) {
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                errorMessage: error instanceof Error ? error.message : "Conversion worker failed",
            },
        });
        console.error(`Job ${jobId} marked as FAILED`);
        throw error;
    }
}, {
    connection: bullMqConnection,
});
filConversionWorkr.on("ready", () => {
    console.log("Conversion worker connected and listening on queue: convert");
});
filConversionWorkr.on("error", (err) => {
    console.error("Conversion worker error:", err);
});
filConversionWorkr.on("failed", (job, err) => {
    console.error(`Conversion failed for job ${job?.id}: ${err.message}`);
});
