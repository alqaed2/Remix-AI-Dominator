import { Request, Response } from "express";
import { getTrendingHashtags } from "../dominatorV3Engine";

export async function trendingHashtagsController(req: Request, res: Response) {
  try {
    const niche = (req.query.topic as string) || "Tech";
    const tags = getTrendingHashtags(niche);
    return res.json({ hashtags: tags });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
