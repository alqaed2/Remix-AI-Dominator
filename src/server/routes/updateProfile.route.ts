import { Router } from "express";
import { updateProfileController } from "../controllers/updateProfile.controller";
import { validateBody, profileSchema } from "../middlewares/validation.middleware";

const router = Router();
router.post("/api/creator/profile", validateBody(profileSchema), updateProfileController);

export default router;
