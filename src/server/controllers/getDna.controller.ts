import { Request, Response } from "express";
import { db } from "../db";

export async function getDnaController(req: Request, res: Response) {
  try {
    const profile = await db.getCreatorProfileByUserId("user_1");
    if (!profile) {
      return res.json([]);
    }
    const dna = await db.getCreatorDNA(profile.id);
    return res.json(dna);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
