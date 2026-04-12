import express from "express";
import { getJobDetails } from "../controllers/jobs.controller.js";
const router = express.Router();
router.get("/:jobId", getJobDetails);
export default router;
