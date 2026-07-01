import { Router } from "express";
import { trendingHashtagsController } from "../controllers/trendingHashtags.controller";

const router = Router();
router.get("/v1/trending-hashtags", trendingHashtagsController);

export default router;
