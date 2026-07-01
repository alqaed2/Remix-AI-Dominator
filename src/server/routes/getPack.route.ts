import { Router } from "express";
import { getPackController } from "../controllers/getPack.controller";

const router = Router();
router.get("/v1/packs/:id", getPackController);

export default router;
