import { Router } from "express";
import { getTrendingVideosController } from "../controllers/getTrendingVideos.controller";

const router = Router();
router.get("/api/video/trending", getTrendingVideosController);

export default router;
