import "dotenv/config";
import { Job, Worker } from "bullmq";
import { CompressJobType } from "./config/upstash";
import { upstashConnection } from "./config/upstash";

// Create Worker
const compressWorker = new Worker(
  "compress",

  async (job: Job<CompressJobType>) => {
    console.log("File compressed download the output");
   
    return { success: true };
  },
  {
    connection: upstashConnection,
    concurrency: 5,
  },
);

compressWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

compressWorker.on("failed", (job, err) => {
  console.log(`❌ Job ${job?.id} failed:`, err.message);
});
