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