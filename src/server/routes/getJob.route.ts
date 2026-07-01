import { Router } from "express";
import { getJobController } from "../controllers/getJob.controller";

const router = Router();
router.get("/v1/jobs/:id", getJobController);

export default router;
