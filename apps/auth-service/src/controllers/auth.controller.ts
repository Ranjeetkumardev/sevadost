import { Request, Response } from "express";

import { authService } from "../services/auth.service";

import { sanitizePhone, sanitizeString } from "../utils/sanitize";

import { validatePhone, validateOtp } from "../validators/auth.validator";

export const sendOtp = async (req: Request, res: Response) => {
  const phone = sanitizePhone(req.body?.phone);

  const validation = validatePhone(phone);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  const result = await authService.sendOtp(phone);

  return res.status(result.statusCode).json(result);
};

export const verifyOtp = async (req: Request, res: Response) => {
  const phone = sanitizePhone(req.body?.phone);

  const otp = sanitizeString(req.body?.otp);

  const phoneValidation = validatePhone(phone);

  if (!phoneValidation.valid) {
    return res.status(400).json({
      success: false,
      message: phoneValidation.message,
    });
  }

  const otpValidation = validateOtp(otp);

  if (!otpValidation.valid) {
    return res.status(400).json({
      success: false,
      message: otpValidation.message,
    });
  }

  const result = await authService.verifyOtp(phone, otp);

  return res.status(result.statusCode).json(result);
};
 