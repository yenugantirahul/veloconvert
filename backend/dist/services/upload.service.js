import path from "path";
const handleUploadedFile = (file) => {
    return {
        originalName: file.originalname,
        storedFileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        localPath: file.path,
        extension: path.extname(file.originalname),
    };
};
export default handleUploadedFile;
