import { Router } from "express";
import { getGrowthHistoryController } from "../controllers/getGrowthHistory.controller";

const router = Router();
router.get("/api/creator/growth-history", getGrowthHistoryController);

export default router;
