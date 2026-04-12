import { prisma } from "../lib/prisma.ts";
import { Request, Response } from "express";
type ParamsType = {
  jobId: string;
};

export const getJobDetails = async (req: Request<ParamsType>, res: Response) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        status: true,
        outputUrl: true,
        errorMessage: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    return res.json(job);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


