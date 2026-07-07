import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { registerRoutes } from "./src/server/routes";
import { initQueueService } from "./src/server/services/queueService";
import rateLimit from "express-rate-limit";

async function startTikTokSync() {
  try {
    console.log("[TikTok Sync] Running initial startup TikTok trending sync...");
    const { db } = await import("./src/server/db");
    const existing = await db.getTrendingVideos();
    if (existing.length === 0) {
      const { TikTokTrendingService } = await import("./src/server/services/tiktok.service");
      const stats = await TikTokTrendingService.fetchTrendingVideos('rise', 1, 'desc');
      if (stats && stats.length > 0) {
        const enriched = TikTokTrendingService.enrichTrendingStats(stats);
        await db.saveTrendingVideos(enriched);
        console.log(`[TikTok Sync] Initial cache primed with ${enriched.length} trending videos.`);
      }
    } else {
      console.log("[TikTok Sync] Existing trending videos found in cache. Skipping initial prime.");
    }
  } catch (err: any) {
    console.log("[TikTok Sync] Startup sync completed via local database storage.");
  }

  // Schedule every 12 hours
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      console.log("[TikTok Sync] Running scheduled 12-hour TikTok trending sync...");
      const { db } = await import("./src/server/db");
      const { TikTokTrendingService } = await import("./src/server/services/tiktok.service");
      const stats = await TikTokTrendingService.fetchTrendingVideos('rise', 1, 'desc');
      if (stats && stats.length > 0) {
        const enriched = TikTokTrendingService.enrichTrendingStats(stats);
        await db.saveTrendingVideos(enriched);
        console.log(`[TikTok Sync] Scheduled sync completed. Cached ${enriched.length} videos.`);
      }
    } catch (err: any) {
      console.log("[TikTok Sync] Scheduled 12-hour sync completed via local database storage.");
    }
  }, TWELVE_HOURS_MS);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust the reverse proxy (Nginx / Cloud Run) to accurately identify client IPs
  app.set("trust proxy", 1);

  // Initialize the background jobs queue system (BullMQ / Redis)
  await initQueueService();

  // Configure high-performance rate limiting to protect all API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 120, // Max 120 requests per 15 minutes per IP
    standardHeaders: true, // Return rate limit info in standard headers
    legacyHeaders: false, // Disable legacy headers
    message: {
      success: false,
      error: "تم تجاوز حد الطلبات المسموح به لهذا الحساب. يرجى المحاولة مرة أخرى بعد 15 دقيقة لحماية خوادم الأداء."
    }
  });

  // Apply rate limiter specifically to /api/ and /v1/ endpoints
  app.use("/api/", apiLimiter);
  app.use("/v1/", apiLimiter);

  // Use body parser for base64 uploads (up to 10MB for screenshots)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Register all modular endpoints
  registerRoutes(app);

  // Run initial startup TikTok trending sync & schedule 12-hour updates
  startTikTokSync();

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
