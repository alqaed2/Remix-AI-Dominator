import { Request, Response } from "express";
import { db } from "../db";
import { executeTask } from "../services/queueService";

export async function remixTopicController(req: Request, res: Response) {
  try {
    const { videoTitle, videoDescription, niche } = req.body;
    if (!videoTitle) {
      return res.status(400).json({ error: "Video title/topic is required." });
    }

    const profile = await db.getCreatorProfileByUserId("user_1");
    const creatorDNA = profile ? await db.getCreatorDNA(profile.id) : [];

    const result = await executeTask("REMIX_TOPIC", {
      videoTitle,
      videoDescription: videoDescription || "",
      niche: niche || (profile?.niche || "التقنية"),
      creatorDNA,
      profile
    });

    return res.json(result);
  } catch (error: any) {
    console.log("[AI DOMINATOR Engine] Topic remixing completed.");
    res.status(500).json({ error: error.message });
  }
}
