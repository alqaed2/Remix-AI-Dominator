import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { registerRoutes } from "./src/server/routes";
import { initQueueService } from "./src/server/services/queueService";
import rateLimit from "express-rate-limit";

async function startServer() {
  const app = express();
  const PORT = 3000;

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
