import { Router } from "express";
import { readyzController } from "../controllers/readyz.controller";

const router = Router();
router.get("/readyz", readyzController);

export default router;
