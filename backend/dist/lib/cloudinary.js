import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
export function uploadToCloudinary(fileBuffer, folder = "veloconvert") {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: "auto",
        }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error("Cloudinary upload failed"));
            resolve(result);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
}
