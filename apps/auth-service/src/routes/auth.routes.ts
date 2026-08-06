import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

import {
  sendOtp,
  verifyOtp,
  refreshToken,
  getMe,
  getSessions,
  logout,
  logoutAll,
} from "../controllers/auth.controller";

const router = Router();

// ====================== PUBLIC ROUTES ======================
router.get("/health", (req, res) => {
  res.status(200).json({
    service: "auth-service",
    status: "healthy",
  });
});

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh-token", refreshToken);

// ====================== PROTECTED ROUTES ======================
router.get("/me", authenticate, getMe);
router.get("/sessions", authenticate, getSessions);

router.post("/logout", authenticate, logout);
router.post("/logout-all", authenticate, logoutAll);

export default router;
