import { Request, Response } from "express";
import { uploadToCloudinary } from "../services/upload.service.ts";
import { prisma } from "../lib/prisma.ts";
import { auth } from "../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import fileQueue from "../config/upstash.ts";
import { unlink } from "fs/promises";
export const uploadFileController = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = session.user.id;

    const { targetFormat } = req.body as { targetFormat?: string };

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    if (!targetFormat) {
      return res.status(400).json({
        success: false,
        message: "targetFormat is required",
      });
    }

    const tempFilePath = req.file.path;

    // Upload to Cloudinary from disk using chunked transfer for large files.
    const uploadFile = await uploadToCloudinary(
      tempFilePath,
      req.file.originalname,
      "uploads",
    );

    try {
      await unlink(tempFilePath);
    } catch {
      // Best-effort cleanup if file was already removed.
    }

    const uploadJob = await prisma.job.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        inputUrl: uploadFile?.secure_url,
        inputFormat: req.file.originalname.split(".").pop() || "unknown",
        outputFormat: targetFormat,
        status: "PENDING",
      },
    });

    let queueAccepted = true;

    try {
      await fileQueue.add(
        "convert",
        {
          jobId: uploadJob.id,
          userId,
          inputUrl: uploadJob.inputUrl,
          inputFormat: uploadJob.inputFormat,
          outputFormat: uploadJob.outputFormat,
        },
        {
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    } catch {
      queueAccepted = false;
    }

    return res.status(queueAccepted ? 200 : 202).json({
      message: queueAccepted
        ? "Uploaded successfully. Conversion job queued."
        : "File uploaded successfully, but conversion queue is temporarily unavailable.",
      success: true,
      data: {
        upload: uploadFile,
        job: uploadJob,
        queueAccepted,
      },
    });
  } catch (error: any) {
    const errorMessage = error?.message || "Unknown error";
    const errorStack = error?.stack || "";
    console.error("uploadFileController error:", {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });

    if (req.file?.path) {
      try {
        await unlink(req.file.path);
      } catch {
        // Best-effort cleanup.
      }
    }

    return res.status(500).json({
      message: "File Upload Error",
      success: false,
      error: errorMessage,
    });
  }
};
