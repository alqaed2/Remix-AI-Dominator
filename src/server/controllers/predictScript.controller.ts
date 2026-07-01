import { Request, Response } from "express";
import { db } from "../db";
import { executeTask } from "../services/queueService";

export async function predictScriptController(req: Request, res: Response) {
  try {
    const { script } = req.body;
    if (!script) {
      return res.status(400).json({ error: "Script input is required." });
    }

    const profile = await db.getCreatorProfileByUserId("user_1");
    const dna = profile ? await db.getCreatorDNA(profile.id) : [];
    const nicheGenome = profile ? await db.getNicheGenome(profile.niche) : null;

    const prediction = await executeTask("PREDICT_SCRIPT", { script, dna, nicheGenome });
    return res.json(prediction);
  } catch (error: any) {
    console.log("[AI DOMINATOR Engine] Script prediction processed.");
    res.status(500).json({ error: error.message });
  }
}
