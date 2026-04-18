import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma.ts";
import { bullMqConnection } from "../config/upstash.ts";
import convertapi from "../config/convertapi.ts";
import cloudinary from "../config/cloudinary.ts";
import { uploadToCloudinary } from "../services/upload.service.ts";
console.log("Loading conversion worker...");

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
      const result = convertapi.convert(outputFormat, {
        File: inputUrl,
        storeFile: false,
      });

      // const tempFilePath = req.file.path;

      // const uploadOuput = await uploadToCloudinary(
      
      // )
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          outputUrl: inputUrl,
        },
      });

      console.log(`Job ${jobId} marked as COMPLETED`);
    } catch (error) {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          errorMessage:
            error instanceof Error ? error.message : "Conversion worker failed",
        },
      });

      console.error(`Job ${jobId} marked as FAILED`);

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

filConversionWorkr.on("error", (err) => {
  console.error("Conversion worker error:", err);
});

filConversionWorkr.on("failed", (job, err) => {
  console.error(`Conversion failed for job ${job?.id}: ${err.message}`);
});
