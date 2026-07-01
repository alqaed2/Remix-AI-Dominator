import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/server/db";
import { analyzeScreenshot, predictVideoSuccess, generateDailyMission, analyzeVideoUrl, remixTopicWithDNA } from "./src/server/gemini";
import { createJob, getJob, getPack, getTrendingHashtags, generateWarhead, fetchImageAsBase64 } from "./src/server/dominatorV3Engine";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cache daily growth mission by niche to avoid hitting free-tier 20-request limit
  let cachedMission: any = null;
  let cachedMissionNiche: string = "";
  let cachedMissionTime: number = 0;

  // Use body parser for base64 uploads (up to 10MB for screenshots)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Routes
  
  // 1. Get user and creator profile (Defaulting to user_1 for standard MVP)
  app.get("/api/creator/profile", (req, res) => {
    try {
      const profile = db.getCreatorProfileByUserId("user_1");
      if (!profile) {
        // Create default profile if not exists
        const defaultProfile = db.addCreatorProfile({
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
  });

  // 2. Save/Update creator profile
  app.post("/api/creator/profile", (req, res) => {
    try {
      const { followerCount, niche, country, language } = req.body;
      
      // Invalidate cached growth mission since the niche is potentially updated
      cachedMission = null;
      
      const updatedProfile = db.addCreatorProfile({
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
  });

  // 3. Get creator DNA traits
  app.get("/api/creator/dna", (req, res) => {
    try {
      const profile = db.getCreatorProfileByUserId("user_1");
      if (!profile) {
        return res.json([]);
      }
      const dna = db.getCreatorDNA(profile.id);
      return res.json(dna);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Reset DB to initial seeded states (useful for demonstrating multiple scenarios)
  app.post("/api/creator/reset", (req, res) => {
    try {
      // Clear mission cache on DB reset
      cachedMission = null;
      db.resetDB();
      return res.json({ status: "success", message: "تمت إعادة تعيين قاعدة البيانات للتكوين الأولي" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Get Niche and Country benchmarks
  app.get("/api/genomes", (req, res) => {
    try {
      const genomes = db.getAllNicheGenomes();
      return res.json(genomes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5b. Get Weekly Growth History Trend
  app.get("/api/creator/growth-history", (req, res) => {
    try {
      const profile = db.getCreatorProfileByUserId("user_1");
      if (!profile) {
        return res.json([]);
      }

      const videos = db.getVideos(profile.id);
      
      // Sort videos by createdAt ascending
      const sortedVideos = [...videos].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Grouping by calendar week number
      const weeks: Record<string, typeof sortedVideos> = {};
      sortedVideos.forEach(vid => {
        const date = new Date(vid.createdAt);
        // Calculate week of year or simple 7-day interval
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 3600 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        const weekKey = `${date.getFullYear()}-W${weekNumber}`;
        if (!weeks[weekKey]) {
          weeks[weekKey] = [];
        }
        weeks[weekKey].push(vid);
      });

      const keys = Object.keys(weeks).sort();
      const historyData: { weekLabel: string; score: number; videoCount: number; dateRange: string }[] = [];

      keys.forEach((weekKey, index) => {
        const weekVids = weeks[weekKey];
        let totalWeightedScore = 0;
        let count = 0;

        weekVids.forEach(v => {
          const met = db.getMetrics(v.id);
          if (met && met.status === 'PROCESSED') {
            // Formula for Video Performance / Growth Score
            // Normalizing different metrics into a 0 - 100 range.
            const viewsScore = Math.min(30, (met.views / 25000) * 30); // Max 30 points (average view target is 25K)
            const likesScore = Math.min(25, (met.likes / 2500) * 25);   // Max 25 points
            const savesScore = Math.min(20, (met.saves / 1000) * 20);   // Max 20 points
            const sharesScore = Math.min(10, (met.shares / 500) * 10);  // Max 10 points
            const compScore = Math.min(15, (met.completionRatePercentage / 50) * 15); // Max 15 points
            
            const videoScore = Math.round(viewsScore + likesScore + savesScore + sharesScore + compScore);
            const finalScore = Math.max(35, Math.min(100, videoScore));
            
            totalWeightedScore += finalScore;
            count++;
          }
        });

        if (count > 0) {
          const avgScore = Math.round(totalWeightedScore / count);
          
          // Get start & end of this week's videos for a beautiful subtitle or range label
          const sortedWeekVids = [...weekVids].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const firstDate = new Date(sortedWeekVids[0].createdAt);
          const lastDate = new Date(sortedWeekVids[sortedWeekVids.length - 1].createdAt);
          
          const opt: Intl.DateTimeFormatOptions = { month: 'numeric', day: 'numeric' };
          const dateRangeStr = firstDate.toLocaleDateString('ar-EG', opt) === lastDate.toLocaleDateString('ar-EG', opt)
            ? firstDate.toLocaleDateString('ar-EG', opt)
            : `${firstDate.toLocaleDateString('ar-EG', opt)} - ${lastDate.toLocaleDateString('ar-EG', opt)}`;

          historyData.push({
            weekLabel: `الأسبوع ${index + 1}`,
            score: avgScore,
            videoCount: count,
            dateRange: dateRangeStr
          });
        }
      });

      return res.json(historyData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5c. Analyze Video URL with Gemini AI
  app.post("/api/video/analyze-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "الرجاء توفير رابط الفيديو لتحليله" });
      }
      const analysis = await analyzeVideoUrl(url);
      return res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Receive uploaded screenshot and metadata to trigger analysis and update DNA profile
  app.post("/api/video/upload-screenshot", async (req, res) => {
    try {
      const { base64Image, mimeType, videoMeta } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: "Image payload is required." });
      }

      const profile = db.getCreatorProfileByUserId("user_1");
      if (!profile) {
        return res.status(400).json({ error: "Creator profile not configured. Configure onboarding first." });
      }

      const actualMime = mimeType || "image/jpeg";
      // Clear data url header if present in string
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

      // Vision AI Metrics Extraction
      const metrics = await analyzeScreenshot(cleanBase64, actualMime);

      // Create new video entry
      const videoId = `vid_${Date.now()}`;
      const newVideo = db.addVideo({
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
      const newMetrics = db.addMetrics({
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
      const dna = db.getCreatorDNA(profile.id);
      db.saveCreatorDNA(profile.id, dna);

      // Invalidate daily mission cache since new video data updates DNA and should affect recommendations
      cachedMission = null;

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
  });

  // 6b. Manually update video metrics (gives override control to user to prevent Vision AI errors)
  app.post("/api/video/update-metrics", async (req, res) => {
    try {
      const { videoId, views, likes, comments, shares, saves, watchTimeSeconds, completionRatePercentage } = req.body;
      if (!videoId) {
        return res.status(400).json({ error: "Video ID is required." });
      }

      const profile = db.getCreatorProfileByUserId("user_1");
      if (!profile) {
        return res.status(400).json({ error: "Creator profile not configured." });
      }

      const existingMetrics = db.getMetrics(videoId);
      if (!existingMetrics) {
        return res.status(404).json({ error: "Metrics not found for this video." });
      }

      // Add/update metrics in database
      const updatedMetrics = db.addMetrics({
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
      const dna = db.getCreatorDNA(profile.id);
      db.saveCreatorDNA(profile.id, dna);

      // Invalidate cached mission because manual metrics modify DNA traits
      cachedMission = null;

      return res.json({
        success: true,
        metrics: updatedMetrics,
        dna
      });
    } catch (error: any) {
      console.log("[AI DOMINATOR Engine] Metric update processed.");
      res.status(500).json({ error: error.message });
    }
  });

  // 7. Pre-publish Future Video Script Simulator
  app.post("/api/video/predict-script", async (req, res) => {
    try {
      const { script } = req.body;
      if (!script) {
        return res.status(400).json({ error: "Script input is required." });
      }

      const profile = db.getCreatorProfileByUserId("user_1");
      const dna = profile ? db.getCreatorDNA(profile.id) : [];
      const nicheGenome = profile ? db.getNicheGenome(profile.niche) : null;

      const prediction = await predictVideoSuccess(script, dna, nicheGenome);
      return res.json(prediction);
    } catch (error: any) {
      console.log("[AI DOMINATOR Engine] Script prediction processed.");
      res.status(500).json({ error: error.message });
    }
  });

  // 8. Generate Today's Growth Mission
  app.get("/api/creator/daily-mission", async (req, res) => {
    try {
      const profile = db.getCreatorProfileByUserId("user_1");
      const niche = profile?.niche || "Tech";
      const profileId = profile?.id || "profile_1";
      const dna = db.getCreatorDNA(profileId);

      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (cachedMission && cachedMissionNiche === niche && (now - cachedMissionTime) < ONE_DAY) {
        console.log("[AI DOMINATOR Engine] Returning cached daily mission for niche:", niche);
        return res.json(cachedMission);
      }

      const mission = await generateDailyMission(dna, niche);
      cachedMission = mission;
      cachedMissionNiche = niche;
      cachedMissionTime = now;
      return res.json(mission);
    } catch (error: any) {
      console.log("[AI DOMINATOR Engine] Daily mission processed.");
      res.status(500).json({ error: error.message });
    }
  });

  // 9. Remix Topic with Creator DNA and prediction
  app.post("/api/video/remix-topic", async (req, res) => {
    try {
      const { videoTitle, videoDescription, niche } = req.body;
      if (!videoTitle) {
        return res.status(400).json({ error: "Video title/topic is required." });
      }

      const profile = db.getCreatorProfileByUserId("user_1");
      const creatorDNA = profile ? db.getCreatorDNA(profile.id) : [];

      const result = await remixTopicWithDNA(
        videoTitle,
        videoDescription || "",
        niche || (profile?.niche || "التقنية"),
        creatorDNA,
        profile
      );

      return res.json(result);
    } catch (error: any) {
      console.log("[AI DOMINATOR Engine] Topic remixing completed.");
      res.status(500).json({ error: error.message });
    }
  });

  // === DominatorV3 Custom Integration Endpoints ===
  
  // A. Direct Synchronous Generator
  app.post("/api/tactical/execute", async (req, res) => {
    try {
      const { niche, mode, style } = req.body;
      if (!niche) {
        return res.status(400).json({ error: "الرجاء توفير التخصص (niche)" });
      }
      const data = await generateWarhead(niche, mode || "REELS_ENGINE", style);
      return res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // A.2. Single Image Generator Endpoint (Live AI Rendering)
  app.post("/v1/generate-image", async (req, res) => {
    try {
      const { prompt, niche, aspect_ratio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "الرجاء توفير برومبت الصورة (prompt)" });
      }
      const base64 = await fetchImageAsBase64(prompt, niche || "Tech", aspect_ratio || "16:9");
      if (base64) {
        return res.json({ success: true, image_base64: base64 });
      } else {
        return res.status(500).json({ error: "فشل توليد الصورة الفنية" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // B. Async Build Pack Job Launcher
  app.post("/v1/build-pack", (req, res) => {
    try {
      const { niche, mode, style, promptOnly } = req.body;
      if (!niche) {
        return res.status(400).json({ error: "niche required" });
      }
      const jobId = createJob(niche, mode || "REELS_ENGINE", style, !!promptOnly);
      return res.json({ job_id: jobId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // C. Async Job Status Polling
  app.get("/v1/jobs/:id", (req, res) => {
    try {
      const job = getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "job not found" });
      }
      return res.json({
        id: job.id,
        status: job.status,
        progress: job.progress,
        logs: job.logs,
        pack_id: job.pack_id,
        error: job.error
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // D. Async Pack Retrieval
  app.get("/v1/packs/:id", (req, res) => {
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
  });

  // E. Trending Hashtags
  app.get("/v1/trending-hashtags", (req, res) => {
    try {
      const niche = (req.query.topic as string) || "Tech";
      const tags = getTrendingHashtags(niche);
      return res.json({ hashtags: tags });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // F. Healthz Probe
  app.get("/readyz", (req, res) => {
    return res.json({ ready: true });
  });

  // Vite middleware setup for Development / Asset serving for Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
