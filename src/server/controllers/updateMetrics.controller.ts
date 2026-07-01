import { Request, Response } from "express";
import { db } from "../db";
import { missionCache } from "../services/missionCache";

export async function updateMetricsController(req: Request, res: Response) {
  try {
    const { videoId, views, likes, comments, shares, saves, watchTimeSeconds, completionRatePercentage } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: "Video ID is required." });
    }

    const profile = await db.getCreatorProfileByUserId("user_1");
    if (!profile) {
      return res.status(400).json({ error: "Creator profile not configured." });
    }

    const existingMetrics = await db.getMetrics(videoId);
    if (!existingMetrics) {
      return res.status(404).json({ error: "Metrics not found for this video." });
    }

    // Add/update metrics in database
    const updatedMetrics = await db.addMetrics({
      ...existingMetrics,
      views: Number(views) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      saves: Number(saves) || 0,
      watchTimeSeconds: Number(watchTimeSeconds) || 0,
      completionRatePercentage: Number(completionRatePercentage) || 0,
      status: "PROCESSED",
      createdAt: existingMetrics.createdAt || new Date().toISOString()
    });

    // Force recalculate and update DNA
    const dna = await db.getCreatorDNA(profile.id);
    await db.saveCreatorDNA(profile.id, dna);

    // Invalidate cached mission because manual metrics modify DNA traits
    missionCache.invalidate();

    return res.json({
      success: true,
      metrics: updatedMetrics,
      dna
    });
  } catch (error: any) {
    console.log("[AI DOMINATOR Engine] Metric update processed.");
    res.status(500).json({ error: error.message });
  }
}
