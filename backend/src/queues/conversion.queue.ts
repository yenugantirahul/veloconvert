import { Worker } from "bullmq";

export const fileConversionWorker = new Worker("convert", async (job) => {
  return { status: "Completed", input: job.data.inputUrl };
});

fileConversionWorker.on("completed", (job) => {
  console.log("Completed");
});
