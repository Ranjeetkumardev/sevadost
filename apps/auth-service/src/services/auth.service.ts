import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { Otp } from "../models/Otp.model";
import { User } from "../models/User.model";
import { RefreshToken } from "../models/RefreshToken.model";
import { config } from "../config";
import { successResponse, errorResponse } from "../utils/response";

class AuthService {
  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }
  async sendOtp(phone: string) {
    const existingOtp = await Otp.findOne({ phone });

    if (existingOtp) {
      const diff =
        Date.now() - new Date((existingOtp as any).createdAt).getTime();

      if (diff < 60000) {
        return errorResponse("Please wait before requesting another OTP", 429);
      }

      await Otp.deleteOne({
        _id: existingOtp._id,
      });
    }

    const otp = this.generateOtp();

    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.create({
      phone,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    /*
      Future:

      await smsProvider.send({
         phone,
         message:`Your OTP is ${otp}`
      });
  */

    if (config.env === "development") {
      console.log(`OTP for ${phone}: ${otp}`);
    }

    return successResponse("If the account exists, an OTP has been sent.");
  }

  async verifyOtp(phone: string, otp: string) {
    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
      return errorResponse("Verification failed", 400);
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({
        _id: otpRecord._id,
      });

      return errorResponse("Verification failed", 400);
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      otpRecord.attempts += 1;

      await otpRecord.save();

      return errorResponse("Verification failed", 400);
    }

    await Otp.deleteOne({
      _id: otpRecord._id,
    });

    let user = await User.findOne({
      phone,
    });

    let isNewUser = false;

    if (!user) {
      user = await User.create({
        phone,
        isPhoneVerified: true,
      });

      isNewUser = true;
    }

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.role,
      user.refreshTokenVersion,
    );

    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
    });

    return successResponse("Authentication successful", {
      isNewUser,
      user,
      ...tokens,
    });
  }

  async generateTokens(userId: string, role: string, tokenVersion: number) {
    const accessToken = jwt.sign(
      {
        userId,
        role,
      },
      config.jwt.accessSecret,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = jwt.sign(
      {
        userId,
        tokenVersion,
      },
      config.jwt.refreshSecret,
      {
        expiresIn: "7d",
      },
    );

    await RefreshToken.create({
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
