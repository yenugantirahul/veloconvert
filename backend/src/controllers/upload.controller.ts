// src/controllers/file.controller.ts
import { Request, Response } from "express";
import { uploadToCloudinary } from "../lib/uploadToCloudinary.ts"

export const uploadFileController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, "veloconvert/input");

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        originalName: req.file.originalname,
        resourceType: result.resource_type,
        format: result.format,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
    });
  }
};