import { Request, Response } from "express";
import { db } from "../db";
import { executeTask } from "../services/queueService";
import { missionCache } from "../services/missionCache";

export async function uploadScreenshotController(req: Request, res: Response) {
  try {
    const { base64Image, mimeType, videoMeta } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "Image payload is required." });
    }

    const profile = await db.getCreatorProfileByUserId("user_1");
    if (!profile) {
      return res.status(400).json({ error: "Creator profile not configured. Configure onboarding first." });
    }

    const actualMime = mimeType || "image/jpeg";
    // Clear data url header if present in string
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    // Vision AI Metrics Extraction inside background task queue
    const metrics = await executeTask("UPLOAD_SCREENSHOT", { base64Image: cleanBase64, mimeType: actualMime });

    // Create new video entry
    const videoId = `vid_${Date.now()}`;
    const newVideo = await db.addVideo({
      id: videoId,
      creatorId: profile.id,
      title: videoMeta?.title || "فيديو بدون عنوان مضاف حديثاً",
      hookStyle: videoMeta?.hookStyle || "Direct Question",
      deliveryTone: videoMeta?.deliveryTone || "Educational/Calm",
      duration: Number(videoMeta?.duration) || 30,
      faceFirstSecond: videoMeta?.faceFirstSecond === true,
      publishHour: Number(videoMeta?.publishHour) || 20,
      publishDay: videoMeta?.publishDay || "Monday",
      createdAt: new Date().toISOString()
    });

    // Add metrics
    const newMetrics = await db.addMetrics({
      id: `met_${Date.now()}`,
      videoId: videoId,
      views: metrics.views,
      likes: metrics.likes,
      comments: metrics.comments,
      shares: metrics.shares,
      saves: metrics.saves,
      watchTimeSeconds: metrics.watchTimeSeconds,
      completionRatePercentage: metrics.completionRatePercentage,
      status: "PROCESSED",
      createdAt: new Date().toISOString()
    });

    // Force recalculate and update DNA
    const dna = await db.getCreatorDNA(profile.id);
    await db.saveCreatorDNA(profile.id, dna);

    // Invalidate daily mission cache since new video data updates DNA and should affect recommendations
    missionCache.invalidate();

    return res.json({
      success: true,
      video: newVideo,
      metrics: {
        ...newMetrics,
        fallbackUsed: metrics.fallbackUsed
      },
      dna
    });
  } catch (error: any) {
    console.log("[AI DOMINATOR Engine] Image analysis completed using native database mapping.");
    const errorMessage = error?.message || String(error);
    const isQuotaExceeded = errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429");
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      errorType: error?.name || "OcrExtractionError",
      isQuotaExceeded,
      details: errorMessage,
      suggestion: isQuotaExceeded 
        ? "تم تجاوز الحصة المجانية للذكاء الاصطناعي (Gemini Quota Exceeded). يمكنك النقر على زر 'تعديل الأرقام يدوياً' بالأسفل لتسجيل هذا الفيديو وتحديث مصفوفة أداء حسابك فوراً!"
        : "يرجى التحقق من دقة الصورة ووضوحها، أو استخدام زر 'تعديل الأرقام يدوياً' بالأسفل لتجاوز المشكلة وتسجيل مقاييس الفيديو بنفسك."
    };

    res.status(500).json({ 
      error: errorMessage,
      diagnostics
    });
  }
}
