import { Queue } from "bullmq";

export const bullMqConnection = {
  host: process.env.UPSTASH_REDIS_ENDPOINT,
  port: Number(process.env.UPSTASH_REDIS_PORT || 6379),
  password: process.env.UPSTASH_REDIS_PASSWORD,
  tls: {},
};

const fileQueue = new Queue("convert", {
  connection: bullMqConnection,
});

export default fileQueue;
