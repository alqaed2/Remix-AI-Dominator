import { Request, Response } from "express";
import { db } from "../db";
import { TikTokTrendingService } from "../services/tiktok.service";
import { TRENDING_VIDEOS_DB } from "../../data/trendingVideos";

export async function getTrendingVideosController(req: Request, res: Response) {
  const forceRefresh = req.query.refresh === "true";
  
  try {
    let videos = await db.getTrendingVideos();
    let source = "database";

    // If cache is empty or forceRefresh is true, fetch from RapidAPI
    if (videos.length === 0 || forceRefresh) {
      try {
        console.log(`[Trending Controller] Fetching fresh TikTok videos (forceRefresh: ${forceRefresh})...`);
        const result = await TikTokTrendingService.fetchTrendingVideos('rise', 1, 'desc');
        
        if (result.stats && result.stats.length > 0) {
          const enriched = TikTokTrendingService.enrichTrendingStats(result.stats);
          
          if (result.source === 'rapidapi') {
            await db.saveTrendingVideos(enriched);
            videos = enriched;
            source = "rapidapi";
            console.log(`[Trending Controller] Cache successfully updated with ${enriched.length} live videos.`);
          } else {
            videos = enriched;
            source = "fallback";
            console.log(`[Trending Controller] Served dynamic high-fidelity simulation. Details: ${result.errorDetails || 'None'}`);
          }
        } else {
          console.log("[Trending Controller] No stats returned from service. Using existing cache or pre-baked DB.");
          if (videos.length === 0) {
            videos = TRENDING_VIDEOS_DB;
            source = "fallback";
          }
        }
      } catch (apiError: any) {
        console.log("[Trending Controller] Unexpected sync error, falling back gracefully:", apiError.message);
        if (videos.length === 0) {
          videos = TRENDING_VIDEOS_DB;
          source = "fallback";
        }
      }
    }

    return res.json({
      success: true,
      source,
      refreshedAt: new Date().toISOString(),
      videos
    });
  } catch (error: any) {
    console.log("[Trending Controller] Notice: Served local stable metrics fallback.");
    return res.json({
      success: true,
      source: "fallback",
      refreshedAt: new Date().toISOString(),
      videos: TRENDING_VIDEOS_DB
    });
  }
}
