import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.ts";

export const uploadToCloudinary = async (
  localFilePath: string,
  originalName: string,
  folder: string,
): Promise<UploadApiResponse> => {
  const publicIdBase = originalName.split(".")[0]?.replace(/[^a-zA-Z0-9_-]/g, "_");

  console.log("Starting Cloudinary upload:", {
    localFilePath,
    originalName,
    folder,
    publicIdBase,
  });

  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload_large(
      localFilePath,
      {
        folder,
        resource_type: "auto",
        public_id: publicIdBase,
        chunk_size: 6_000_000,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
          return;
        }

        if (!result) {
          console.error("Cloudinary upload returned no result");
          reject(new Error("Cloudinary upload returned no result"));
          return;
        }

        console.log("Cloudinary upload successful:", result.secure_url);
        resolve(result);
      },
    );
  });
};