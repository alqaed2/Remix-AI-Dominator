import { Request, Response } from "express";
import { createJob } from "../dominatorV3Engine";

export async function buildPackController(req: Request, res: Response) {
  try {
    const { niche, mode, style, promptOnly } = req.body;
    if (!niche) {
      return res.status(400).json({ error: "niche required" });
    }
    const jobId = createJob(niche, mode || "REELS_ENGINE", style, !!promptOnly);
    return res.json({ job_id: jobId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
