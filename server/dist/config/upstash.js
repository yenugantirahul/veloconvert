"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filCompressorQueue = exports.upstashConnection = void 0;
require("dotenv/config");
const bullmq_1 = require("bullmq");
function normalizeRedisHost(value) {
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return new URL(value).hostname;
    }
    return value;
}
if (!process.env.UPSTASH_REDIS_HOST || !process.env.UPSTASH_REDIS_PASSWORD) {
    throw new Error("Missing UPSTASH_REDIS_HOST or UPSTASH_REDIS_PASSWORD. BullMQ needs the Upstash Redis TCP host and password, not the REST URL.");
}
exports.upstashConnection = {
    host: normalizeRedisHost(process.env.UPSTASH_REDIS_HOST),
    port: 6379,
    password: process.env.UPSTASH_REDIS_PASSWORD,
    tls: {},
};
exports.filCompressorQueue = new bullmq_1.Queue("compress", { connection: exports.upstashConnection });
