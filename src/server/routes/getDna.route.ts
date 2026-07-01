import { Router } from "express";
import { getDnaController } from "../controllers/getDna.controller";

const router = Router();
router.get("/api/creator/dna", getDnaController);

export default router;
