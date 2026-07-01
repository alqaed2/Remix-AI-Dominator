import { Router } from "express";
import { tacticalExecuteController } from "../controllers/tacticalExecute.controller";
import { validateBody, tacticalExecuteSchema } from "../middlewares/validation.middleware";

const router = Router();
router.post("/api/tactical/execute", validateBody(tacticalExecuteSchema), tacticalExecuteController);

export default router;
