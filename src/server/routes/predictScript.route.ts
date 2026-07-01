import { Router } from "express";
import { predictScriptController } from "../controllers/predictScript.controller";
import { validateBody, predictScriptSchema } from "../middlewares/validation.middleware";

const router = Router();
router.post("/api/video/predict-script", validateBody(predictScriptSchema), predictScriptController);

export default router;
