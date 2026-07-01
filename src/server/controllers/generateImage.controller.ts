import { Request, Response } from "express";
import { executeTask } from "../services/queueService";

export async function generateImageController(req: Request, res: Response) {
  try {
    const { prompt, niche, aspect_ratio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "الرجاء توفير برومبت الصورة (prompt)" });
    }
    const base64 = await executeTask("GENERATE_IMAGE", {
      prompt,
      niche: niche || "Tech",
      aspect_ratio: aspect_ratio || "16:9"
    });
    if (base64) {
      return res.json({ success: true, image_base64: base64 });
    } else {
      return res.status(500).json({ error: "فشل توليد الصورة الفنية" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
