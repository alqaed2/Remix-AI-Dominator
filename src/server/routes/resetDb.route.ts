import { Router } from "express";
import { resetDbController } from "../controllers/resetDb.controller";

const router = Router();
router.post("/api/creator/reset", resetDbController);

export default router;
