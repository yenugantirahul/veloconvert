import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import authRouter from "./routes/auth.routes.js";
const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(cookieParser());
// Better Auth route FIRST
app.all("/api/auth/*splat", toNodeHandler(auth));
// Put express.json AFTER Better Auth route
app.use(express.json());
app.use("/api", authRouter);
export default app;
