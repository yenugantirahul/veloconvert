import express from "express";
import {
  createJob,
  download,
  getJobStatus,
} from "../controllers/jobs.controller";

const router = express.Router();

router.post("/create", createJob);

router.get("/:jobId/status", getJobStatus);

router.get("/:jobId/download", download);

export default router;
