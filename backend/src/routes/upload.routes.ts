import { Router } from "express";
import multer from "multer";
import upload from "../middlewares/upload.middleware.ts";
import { uploadFileController } from "../controllers/upload.controller.ts";
const router = Router();

router.post("/", upload.single("file"), uploadFileController);

export default router;