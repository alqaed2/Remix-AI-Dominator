import { Router } from "express";
import { remixTopicController } from "../controllers/remixTopic.controller";
import { validateBody, remixTopicSchema } from "../middlewares/validation.middleware";

const router = Router();
router.post("/api/video/remix-topic", validateBody(remixTopicSchema), remixTopicController);

export default router;
