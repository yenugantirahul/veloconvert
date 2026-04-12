import multer from "multer";
import os from "os";
import path from "path";
const MAX_UPLOAD_FILE_SIZE_MB = Number(process.env.MAX_UPLOAD_FILE_SIZE_MB) || 1024;
// Store uploads in OS temp directory so we avoid holding large files in RAM.
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, os.tmpdir());
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
    },
});
const upload = multer({
    storage,
    limits: {
        fileSize: MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024,
        files: 1,
        fields: 10,
        parts: 20,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Only Images, PDFs, and Word docs are allowed."));
        }
    },
});
export default upload;
