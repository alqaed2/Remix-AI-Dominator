import { Request, Response } from "express";
import { db } from "../db";
import { executeTask } from "../services/queueService";
import { missionCache } from "../services/missionCache";

export async function getDailyMissionController(req: Request, res: Response) {
  try {
    const profile = await db.getCreatorProfileByUserId("user_1");
    const niche = profile?.niche || "Tech";
    const profileId = profile?.id || "profile_1";
    const dna = await db.getCreatorDNA(profileId);

    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (missionCache.cachedMission && missionCache.cachedMissionNiche === niche && (now - missionCache.cachedMissionTime) < ONE_DAY) {
      console.log("[AI DOMINATOR Engine] Returning cached daily mission for niche:", niche);
      return res.json(missionCache.cachedMission);
    }

    const mission = await executeTask("GENERATE_DAILY_MISSION", { dna, niche });
    missionCache.cachedMission = mission;
    missionCache.cachedMissionNiche = niche;
    missionCache.cachedMissionTime = now;
    return res.json(mission);
  } catch (error: any) {
    console.log("[AI DOMINATOR Engine] Daily mission processed.");
    res.status(500).json({ error: error.message });
  }
}
