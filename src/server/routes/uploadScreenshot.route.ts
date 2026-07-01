import { Router } from "express";
import { uploadScreenshotController } from "../controllers/uploadScreenshot.controller";
import { validateBody, uploadScreenshotSchema } from "../middlewares/validation.middleware";

const router = Router();
router.post("/api/video/upload-screenshot", validateBody(uploadScreenshotSchema), uploadScreenshotController);

export default router;
