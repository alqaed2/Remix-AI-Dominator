import { Request, Response } from "express";
import { getJob } from "../dominatorV3Engine";

export async function getJobController(req: Request, res: Response) {
  try {
    const job = getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "job not found" });
    }
    return res.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      logs: job.logs,
      pack_id: job.pack_id,
      error: job.error
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
