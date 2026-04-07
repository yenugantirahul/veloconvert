import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
const parseOrigins = (value) => value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];
const authBaseURL = process.env.BETTER_AUTH_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:5000";
const trustedOrigins = [
    "http://localhost:3000",
    "https://veloconvert.vercel.app",
    "https://www.veloconvert.vercel.app",
    ...parseOrigins(process.env.FRONTEND_URL),
    ...parseOrigins(process.env.CORS_ORIGIN),
].filter((origin) => Boolean(origin));
export const auth = betterAuth({
    baseURL: authBaseURL,
    trustedOrigins,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    rateLimit: {
        window: 10,
        max: 100,
    },
    emailAndPassword: {
        enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET,
});
