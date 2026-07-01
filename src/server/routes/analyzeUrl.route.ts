import { Router } from "express";
import { analyzeUrlController } from "../controllers/analyzeUrl.controller";
import { validateBody, analyzeUrlSchema } from "../middlewares/validation.middleware";

const router = Router();
router.post("/api/video/analyze-url", validateBody(analyzeUrlSchema), analyzeUrlController);

export default router;
