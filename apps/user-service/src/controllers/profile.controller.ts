import { Request, Response } from "express";

import {
  getProfile as getProfileService,
  createProfile as createProfileService,
  updateProfile as updateProfileService,
} from "../services/profile.service";

import { validateProfileUpdate } from "../validators/profile.validator";

export const getProfile = async (req: Request, res: Response) => {
  const result = await getProfileService(req.user!.id);

  return res.status(result.statusCode).json(result);
};

export const createProfile = async (req: Request, res: Response) => {
  const result = await createProfileService(req.user!.id);

  return res.status(result.statusCode).json(result);
};

export const updateProfile = async (req: Request, res: Response) => {
  const validation = validateProfileUpdate(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  const result = await updateProfileService(req.user!.id, req.body);

  return res.status(result.statusCode).json(result);
};
