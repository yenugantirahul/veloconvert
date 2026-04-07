import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import { uploadFileController } from "../controllers/upload.controller.js";
const router = Router();
router.post("/", upload.single("file"), uploadFileController);
export default router;
