import { Request, Response } from "express";
import { db } from "../db";

export async function getProfileController(req: Request, res: Response) {
  try {
    const profile = await db.getCreatorProfileByUserId("user_1");
    if (!profile) {
      // Create default profile if not exists
      const defaultProfile = await db.addCreatorProfile({
        id: "profile_1",
        userId: "user_1",
        followerCount: 24500,
        niche: "Tech",
        country: "Saudi Arabia",
        language: "Arabic",
        createdAt: new Date().toISOString()
      });
      return res.json(defaultProfile);
    }
    return res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
