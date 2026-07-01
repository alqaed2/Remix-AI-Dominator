import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// High-performance reusable schemas
export const profileSchema = z.object({
  followerCount: z.union([z.number(), z.string().transform((val) => Number(val))]).default(10000),
  niche: z.string().min(1).max(100).default("Tech"),
  country: z.string().min(1).max(100).default("Saudi Arabia"),
  language: z.string().min(1).max(100).default("Arabic")
});

export const analyzeUrlSchema = z.object({
  url: z.string().url("يجب إدخال رابط صالح لمدخل الفيديو")
});

export const videoMetaSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  hookStyle: z.string().max(100).optional(),
  deliveryTone: z.string().max(100).optional(),
  duration: z.union([z.number(), z.string().transform((val) => Number(val))]).optional(),
  faceFirstSecond: z.boolean().optional(),
  publishHour: z.union([z.number(), z.string().transform((val) => Number(val))]).optional(),
  publishDay: z.string().max(50).optional()
});

export const uploadScreenshotSchema = z.object({
  base64Image: z.string().min(1, "صورة الـ base64 مطلوبة"),
  mimeType: z.string().max(100).optional(),
  videoMeta: videoMetaSchema.optional()
});

export const updateMetricsSchema = z.object({
  videoId: z.string().min(1, "رقم الفيديو مطلوب"),
  views: z.union([z.number(), z.string().transform((val) => Number(val))]).default(0),
  likes: z.union([z.number(), z.string().transform((val) => Number(val))]).default(0),
  comments: z.union([z.number(), z.string().transform((val) => Number(val))]).default(0),
  shares: z.union([z.number(), z.string().transform((val) => Number(val))]).default(0),
  saves: z.union([z.number(), z.string().transform((val) => Number(val))]).default(0),
  watchTimeSeconds: z.union([z.number(), z.string().transform((val) => Number(val))]).default(0),
  completionRatePercentage: z.union([z.number(), z.string().transform((val) => Number(val))]).default(0)
});

export const predictScriptSchema = z.object({
  script: z.string().min(1, "محتوى السيناريو مطلوب للتحليل")
});

export const remixTopicSchema = z.object({
  videoTitle: z.string().min(1, "عنوان الفيديو مطلوب لإعادة صياغته وتخصيصه"),
  videoDescription: z.string().max(1000).optional(),
  niche: z.string().max(100).optional()
});

export const tacticalExecuteSchema = z.object({
  niche: z.string().min(1, "التخصص (niche) مطلوب لتنفيذ الضربة التكتيكية"),
  mode: z.string().max(100).optional(),
  style: z.string().max(100).optional()
});

export const generateImageSchema = z.object({
  prompt: z.string().min(1, "الوصف الفني (prompt) مطلوب للتوليد"),
  niche: z.string().max(100).optional(),
  aspect_ratio: z.string().max(50).optional()
});

export const buildPackSchema = z.object({
  niche: z.string().min(1, "التخصص (niche) مطلوب لبناء الحزمة"),
  mode: z.string().max(100).optional(),
  style: z.string().max(100).optional(),
  promptOnly: z.boolean().optional()
});

// Middleware Factory to validate request body
export function validateBody(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "فشل التحقق من صحة البيانات المدخلة",
          details: error.issues.map(err => ({
            field: err.path.join("."),
            message: err.message
          }))
        });
      }
      return res.status(500).json({ success: false, error: "خطأ داخلي أثناء تصفية البيانات" });
    }
  };
}
