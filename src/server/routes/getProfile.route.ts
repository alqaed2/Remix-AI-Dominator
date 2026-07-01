import { Router } from "express";
import { getProfileController } from "../controllers/getProfile.controller";

const router = Router();
router.get("/api/creator/profile", getProfileController);

export default router;
