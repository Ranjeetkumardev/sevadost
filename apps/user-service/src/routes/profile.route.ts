import { Router } from "express";

import {
  getProfile,
  createProfile,
  updateProfile,
} from "../controllers/profile.controller";

import {
  authMiddleware,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/health", (req, res) => {
   console.log("Health check for user-service");
  res.status(200).json({
    service: "user-service",
    status: "healthy",
  });
});
router.post(
  "/",
  authMiddleware,
  createProfile
);

router.get(
  "/me",
  authMiddleware,
  getProfile
);

router.patch(
  "/me",
  authMiddleware,
  updateProfile
);

export default router;