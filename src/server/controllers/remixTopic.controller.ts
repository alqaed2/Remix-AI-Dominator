import { Request, Response } from "express";
import { db } from "../db";
import { executeTask } from "../services/queueService";
import { remixTopicWithDNA } from "../gemini";

export async function remixTopicController(req: Request, res: Response) {
  try {
    const { videoTitle, videoDescription, niche } = req.body;
    if (!videoTitle) {
      return res.status(400).json({ error: "Video title/topic is required." });
    }

    const profile = await db.getCreatorProfileByUserId("user_1");
    const creatorDNA = profile ? await db.getCreatorDNA(profile.id) : [];

    // Support real-time chunk streaming
    if (req.query.stream === "true" || req.headers.accept === "text/event-stream") {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const result = await remixTopicWithDNA(
        videoTitle,
        videoDescription || "",
        niche || (profile?.niche || "التقنية"),
        creatorDNA,
        profile,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      );

      res.write(`data: ${JSON.stringify({ result })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    const result = await executeTask("REMIX_TOPIC", {
      videoTitle,
      videoDescription: videoDescription || "",
      niche: niche || (profile?.niche || "التقنية"),
      creatorDNA,
      profile
    });

    return res.json(result);
  } catch (error: any) {
    console.log("[AI DOMINATOR Engine] Topic remixing processed.");
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}
