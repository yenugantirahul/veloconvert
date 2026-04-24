import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import jobsRouter from "./routes/jobs.routes"
const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/jobs", jobsRouter)

export default app;
