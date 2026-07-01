import { Router } from "express";
import { generateImageController } from "../controllers/generateImage.controller";
import { validateBody, generateImageSchema } from "../middlewares/validation.middleware";

const router = Router();
router.post("/v1/generate-image", validateBody(generateImageSchema), generateImageController);

export default router;
