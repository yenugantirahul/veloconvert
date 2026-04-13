import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import { uploadFileController } from "../controllers/upload.controller.js";
const router = Router();
const uploadSingle = upload.single("file");
router.post("/", uploadSingle, uploadFileController);
export default router;
