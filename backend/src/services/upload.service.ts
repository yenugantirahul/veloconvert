import path from "path";

export type UploadedFileResponse = {
  originalName: string;
  storedFileName: string;
  mimeType: string;
  size: number;
  localPath: string;
  extension: string;
};

const handleUploadedFile = (
  file: Express.Multer.File
): UploadedFileResponse => {
  return {
    originalName: file.originalname,
    storedFileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    localPath: file.path,
    extension: path.extname(file.originalname),
  };
};


export default handleUploadedFile