import express from "express";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import userRouter from "./routes/user.routes.ts";
import uploadRouter from "./routes/upload.routes.ts";
import upload from "./middlewares/upload.middleware.ts";
import {  uploadFileController } from "./controllers/upload.controller.ts";

const app = express();

app.use(cookieParser());

// Express v5

app.use(
  cors({
    origin: ["http://localhost:3000", "https://veloconvert.vercel.app"],
    credentials: true, // important if using cookies
  }),
);

// Middleware to protect routes

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/user", userRouter);
app.use("/api/upload", upload.single("file"), uploadFileController);

// JSON after Better Auth
app.use(express.json());
export default app;
