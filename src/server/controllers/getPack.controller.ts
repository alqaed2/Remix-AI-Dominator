import { Request, Response } from "express";
import { getPack } from "../dominatorV3Engine";

export async function getPackController(req: Request, res: Response) {
  try {
    const pack = getPack(req.params.id);
    if (!pack) {
      return res.status(404).json({ error: "pack not found" });
    }
    return res.json({
      id: pack.id,
      type: pack.type,
      assets: pack.type === "REELS_ENGINE" ? {
        title: (pack.data as any).title,
        scenes: (pack.data as any).scenes
      } : {
        title: (pack.data as any).title,
        post: (pack.data as any).body,
        visual: {
          prompt: (pack.data as any).image_prompt,
          base64: (pack.data as any).image_base64
        }
      },
      genes: {
        sentiment: pack.data.sentiment,
        framework: (pack.data as any).framework || "Hook-Problem-Solution"
      },
      dominance: {
        hashtags: pack.data.hashtags
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
