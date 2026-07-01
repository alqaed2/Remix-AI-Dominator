import { Router } from "express";
import { getGenomesController } from "../controllers/getGenomes.controller";

const router = Router();
router.get("/api/genomes", getGenomesController);

export default router;
