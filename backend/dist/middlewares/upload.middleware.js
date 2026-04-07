import multer from "multer";
import path from "path";
import fs from "fs";
const uploadPath = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadPath, { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    },
});
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
export default upload;
