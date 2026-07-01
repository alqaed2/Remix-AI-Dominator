import { Request, Response } from "express";
import { db } from "../db";
import { missionCache } from "../services/missionCache";

export async function updateProfileController(req: Request, res: Response) {
  try {
    const { followerCount, niche, country, language } = req.body;
    
    // Invalidate cached growth mission since the niche is potentially updated
    missionCache.invalidate();
    
    const updatedProfile = await db.addCreatorProfile({
      id: "profile_1",
      userId: "user_1",
      followerCount: Number(followerCount) || 10000,
      niche: niche || "Tech",
      country: country || "Saudi Arabia",
      language: language || "Arabic",
      createdAt: new Date().toISOString()
    });
    return res.json(updatedProfile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
