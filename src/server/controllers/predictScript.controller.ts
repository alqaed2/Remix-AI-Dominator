import { Request, Response } from "express";
import { db } from "../db";
import { executeTask } from "../services/queueService";
import { predictVideoSuccess } from "../gemini";

export async function predictScriptController(req: Request, res: Response) {
  try {
    const { script } = req.body;
    if (!script) {
      return res.status(400).json({ error: "Script input is required." });
    }

    const profile = await db.getCreatorProfileByUserId("user_1");
    const dna = profile ? await db.getCreatorDNA(profile.id) : [];
    const nicheGenome = profile ? await db.getNicheGenome(profile.niche) : null;

    // Support real-time chunk streaming
    if (req.query.stream === "true" || req.headers.accept === "text/event-stream") {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const result = await predictVideoSuccess(
        script,
        dna,
        nicheGenome,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );

      res.write(`data: ${JSON.stringify({ result })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    const prediction = await executeTask("PREDICT_SCRIPT", { script, dna, nicheGenome });
    return res.json(prediction);
  } catch (error: any) {
    console.log("[AI DOMINATOR Engine] Script prediction processed.");
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}
