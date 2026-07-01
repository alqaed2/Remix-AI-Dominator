import { Router } from "express";
import { updateMetricsController } from "../controllers/updateMetrics.controller";
import { validateBody, updateMetricsSchema } from "../middlewares/validation.middleware";

const router = Router();
router.post("/api/video/update-metrics", validateBody(updateMetricsSchema), updateMetricsController);

export default router;
