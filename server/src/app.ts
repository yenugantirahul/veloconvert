import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


app.get("/", (req, res) => {
  res.send("Backend is running");
});

export default app;
