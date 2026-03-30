import express from "express";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
const app = express();
app.use(cookieParser());
// Express v5
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true, // important if using cookies
}));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/user", userRouter);
// JSON after Better Auth
app.use(express.json());
export default app;
