import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma.ts";
import { bullMqConnection } from "../config/upstash.ts";

type FileJobData = {
  jobId: string;
  userId: string;
  inputUrl: string;
  inputFormat: string;
  outputFormat: string;
};

export const filConversionWorkr = new Worker<FileJobData>(
  "convert",
  async (job: Job<FileJobData>) => {
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
    } catch (error) {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          errorMessage:
            error instanceof Error
              ? error.message
              : "Conversion worker failed",
        },
      });

      throw error;
    }
  },
  {
    connection: bullMqConnection,
  },
);

filConversionWorkr.on("ready", () => {
  console.log("Conversion worker connected and listening on queue: convert");
});

filConversionWorkr.on("failed", (job, err) => {
  console.error(`Conversion failed for job ${job?.id}: ${err.message}`);
});
