import { Router } from "express";
import multer from "multer";
import upload from "../middlewares/upload.middleware.ts";
import { uploadFileController } from "../controllers/upload.controller.ts";
const router = Router();

const uploadSingle = upload.single("file");

router.post("/", uploadSingle, uploadFileController);

export default router;
