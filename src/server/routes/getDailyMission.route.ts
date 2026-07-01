import { Router } from "express";
import { getDailyMissionController } from "../controllers/getDailyMission.controller";

const router = Router();
router.get("/api/creator/daily-mission", getDailyMissionController);

export default router;
