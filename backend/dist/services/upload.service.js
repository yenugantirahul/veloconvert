import { v2 as cloudinary } from "cloudinary";
export const uploadToCloudinary = async (localFilePath, originalName, folder) => {
    const publicIdBase = originalName.split(".")[0]?.replace(/[^a-zA-Z0-9_-]/g, "_");
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(localFilePath, {
            folder,
            resource_type: "auto",
            public_id: publicIdBase,
            chunk_size: 6_000_000,
        }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (!result) {
                reject(new Error("Cloudinary upload returned no result"));
                return;
            }
            resolve(result);
        });
    });
};
