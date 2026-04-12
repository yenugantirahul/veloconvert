import express from "express";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import jobRouter from "./routes/jobs.routes.js";
const app = express();
const parseOrigins = (value) => value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];
const corsOrigins = [
    "http://localhost:3000",
    "https://veloconvert.vercel.app",
    ...parseOrigins(process.env.FRONTEND_URL),
    ...parseOrigins(process.env.CORS_ORIGIN),
].filter((origin) => Boolean(origin));
app.use(cookieParser());
// Express v5
app.use(cors({
    origin: corsOrigins,
    credentials: true, // important if using cookies
}));
// Middleware to protect routes
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/user", userRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/jobs", jobRouter);
// JSON after Better Auth
app.use(express.json());
export default app;
