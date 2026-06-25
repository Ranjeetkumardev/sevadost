import { Router } from "express";
const router = Router();

import {sendOtp ,verifyOtp } from "../controllers/auth.controller"

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "auth-service",
    status: "healthy",
  });
});
router.post(
  "/send-otp",
  sendOtp
);

router.post(
  "/verify-otp",
  verifyOtp
);
export default router;