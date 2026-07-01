import { Request, Response } from "express";
import { db } from "../db";
import { missionCache } from "../services/missionCache";

export async function resetDbController(req: Request, res: Response) {
  try {
    // Clear mission cache on DB reset
    missionCache.invalidate();
    await db.resetDB();
    return res.json({ status: "success", message: "تمت إعادة تعيين قاعدة البيانات للتكوين الأولي" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
