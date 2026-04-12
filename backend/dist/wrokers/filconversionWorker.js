import { Worker } from "bullmq";
import { prisma } from "../lib/prisma.js";
import { bullMqConnection } from "../config/upstash.js";
export const filConversionWorkr = new Worker("convert", async (job) => {
    const { jobId, inputUrl } = job.data;
    await prisma.job.update({
        where: { id: jobId },
        data: { status: "PROCESSING", errorMessage: null },
    });
    try {
        // TODO: Replace this with actual conversion logic.
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "COMPLETED",
                outputUrl: inputUrl,
            },
        });
    }
    catch (error) {
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                errorMessage: error instanceof Error
                    ? error.message
                    : "Conversion worker failed",
            },
        });
        throw error;
    }
}, {
    connection: bullMqConnection,
});
filConversionWorkr.on("ready", () => {
    console.log("Conversion worker connected and listening on queue: convert");
});
filConversionWorkr.on("failed", (job, err) => {
    console.error(`Conversion failed for job ${job?.id}: ${err.message}`);
});
