import "dotenv/config";
import { Queue } from "bullmq";

function normalizeRedisHost(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return new URL(value).hostname;
  }

  return value;
}

if (!process.env.UPSTASH_REDIS_HOST || !process.env.UPSTASH_REDIS_PASSWORD) {
  throw new Error(
    "Missing UPSTASH_REDIS_HOST or UPSTASH_REDIS_PASSWORD. BullMQ needs the Upstash Redis TCP host and password, not the REST URL."
  );
}

export const upstashConnection = {
  host: normalizeRedisHost(process.env.UPSTASH_REDIS_HOST),
  port: 6379,
  password: process.env.UPSTASH_REDIS_PASSWORD,
  tls: {},
};

export type CompressJobType =  {
  userId: string,
  inputUrl: string,
  inputFormat: string,
  quality?: string,
}

export const filCompressorQueue = new Queue<CompressJobType>("compress", { connection: upstashConnection });
