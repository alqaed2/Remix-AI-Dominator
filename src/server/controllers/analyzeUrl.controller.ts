import { Request, Response } from "express";
import { executeTask } from "../services/queueService";

export async function analyzeUrlController(req: Request, res: Response) {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "الرجاء توفير رابط الفيديو لتحليله" });
    }
    const analysis = await executeTask("ANALYZE_URL", { url });
    return res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
