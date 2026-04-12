import { Router } from "express";
import multer from "multer";
import upload from "../middlewares/upload.middleware.js";
import { uploadFileController } from "../controllers/upload.controller.js";
const router = Router();
const uploadSingle = upload.single("file");
router.post("/", (req, res, next) => {
    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    success: false,
                    message: "File is too large",
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        if (err) {
            return res.status(415).json({
                success: false,
                message: err.message || "Invalid upload",
            });
        }
        next();
    });
}, uploadFileController);
export default router;
