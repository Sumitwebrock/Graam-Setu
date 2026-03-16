import { Router } from "express";
import {
	login,
	verifyOtp,
	profile,
	registerCompatController,
	loginCompatController,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.get("/profile", requireAuth, profile);
router.post("/register", registerCompatController);
router.post("/login-compat", loginCompatController);

export default router;
