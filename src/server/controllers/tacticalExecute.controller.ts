import { Request, Response } from "express";
import { executeTask } from "../services/queueService";

export async function tacticalExecuteController(req: Request, res: Response) {
  try {
    const { niche, mode, style } = req.body;
    if (!niche) {
      return res.status(400).json({ error: "الرجاء توفير التخصص (niche)" });
    }
    const data = await executeTask("BUILD_PACK", {
      jobId: "direct",
      packId: "direct",
      niche,
      mode: mode || "REELS_ENGINE",
      style,
      promptOnly: false
    });
    return res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
