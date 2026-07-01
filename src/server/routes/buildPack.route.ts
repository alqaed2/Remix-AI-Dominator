import { Router } from "express";
import { buildPackController } from "../controllers/buildPack.controller";
import { validateBody, buildPackSchema } from "../middlewares/validation.middleware";

const router = Router();
router.post("/v1/build-pack", validateBody(buildPackSchema), buildPackController);

export default router;
