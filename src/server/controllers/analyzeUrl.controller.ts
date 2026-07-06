import { Request, Response } from "express";
import { executeTask } from "../services/queueService";
import { analyzeVideoUrl } from "../gemini";

export async function analyzeUrlController(req: Request, res: Response) {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "الرجاء توفير رابط الفيديو لتحليله" });
    }

    // Support real-time chunk streaming
    if (req.query.stream === "true" || req.headers.accept === "text/event-stream") {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const result = await analyzeVideoUrl(
        url,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );

      res.write(`data: ${JSON.stringify({ result })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    const analysis = await executeTask("ANALYZE_URL", { url });
    return res.json(analysis);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}
