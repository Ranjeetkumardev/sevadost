import { Request, Response } from "express";
import { User } from "../models/User.model";
import { Otp } from "../models/Otp.model";
import { Session } from "../models/Session.model";
import { RefreshToken } from "../models/RefreshToken.model";

import {
  hash,
  compareHash,
  generateSecureToken,
  generateNumericOtp,
} from "../utils/crypto";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { normalizePhone } from "../validators/auth.validator";
import { successResponse, errorResponse } from "../utils/response";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { countryCode, phoneNumber, purpose = "login" } = req.body;

    const validation = normalizePhone(countryCode, phoneNumber);
    if (!validation.success) {
      console.log("[Send OTP] Validation failed:", validation.message);
      return res.status(400).json(errorResponse(validation.message!, 400));
    }

    const {
      identifier,
      countryCode: normalizedCode,
      nationalNumber,
    } = validation;

    // Find or create user
    let user = await User.findOne({
      "phone.countryCode": normalizedCode,
      "phone.number": nationalNumber,
    });

    if (!user) {
      user = new User({
        phone: {
          countryCode: normalizedCode,
          number: nationalNumber,
          verified: false,
        },
        primaryRole: "customer",
        roles: ["customer"],
        status: "active",
      });
      await user.save();
      console.log("[Send OTP] New user created");
    }

    const otpCode = generateNumericOtp(6);
    const otpHash = hash(otpCode);

    console.log(`[Send OTP] Generated OTP: ${otpCode} (hash saved)`);

    const savedOtp = await Otp.findOneAndUpdate(
      { identifier, purpose: "login" },
      {
        identifier,
        identifierType: "phone",
        purpose: "login",
        otpHash,
        status: "pending",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
      },
      { upsert: true, new: true },
    );

    // console.log("[Send OTP] OTP saved successfully:", savedOtp?._id);

    return res
      .status(200)
      .json(successResponse("OTP sent successfully", { identifier }));
  } catch (error: any) {
    console.error("[Send OTP] Error:", error);
    return res.status(500).json(errorResponse("Failed to send OTP", 500));
  }
};

// export const verifyOtp = async (req: Request, res: Response) => {
//   try {
//     const { countryCode, phoneNumber, otp, deviceInfo } = req.body;

//     const validation = normalizePhone(countryCode, phoneNumber);

//     if (!validation.success) {
//       return res.status(400).json(errorResponse(validation.message!, 400));
//     }

//     const {
//       identifier,
//       countryCode: normalizedCode,
//       nationalNumber,
//     } = validation;
//     console.log("[Verify OTP] Normalized identifier:", identifier);

//     // Use lowercase "login" to match your constants
//     const otpRecord = await Otp.findOne({
//       identifier,
//       purpose: "login",
//     });

//     if (!otpRecord || otpRecord.status === "verified") {
//       return res.status(400).json(errorResponse("Invalid or expired OTP", 400));
//     }

//     if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
//       return res
//         .status(429)
//         .json(errorResponse("Too many attempts. Try again later.", 429));
//     }

//     const isValid = compareHash(otp, otpRecord.otpHash);

//     if (!isValid) {
//       otpRecord.attempts += 1;
//       await otpRecord.save();
//       return res.status(400).json(errorResponse("Invalid OTP", 400));
//     }

//     // Mark OTP as verified
//     otpRecord.status = "verified";
//     otpRecord.verifiedAt = new Date();
//     await otpRecord.save();

//     // Get user
//     let user = await User.findOne({
//       "phone.countryCode": normalizedCode,
//       "phone.number": nationalNumber,
//     });

//     if (!user) {
//       return res.status(404).json(errorResponse("User not found", 404));
//     }

//     // Update verification status
//     user.phone.verified = true;
//     user.lastLoginAt = new Date();
//     await user.save();

//     // Create Session
//     const deviceId = deviceInfo?.deviceId || generateSecureToken(12);

//     const session = new Session({
//       userId: user._id,
//       deviceId,
//       deviceName: deviceInfo?.deviceName,
//       deviceType: deviceInfo?.deviceType || "unknown",
//       platform: deviceInfo?.platform,
//       os: deviceInfo?.os,
//       browser: deviceInfo?.browser,
//       ipAddress: req.ip,
//       userAgent: req.headers["user-agent"],
//       refreshTokenHash: "temp", // ← Temporary value
//       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//     });

//     await session.save();

//     // Generate Tokens
//     const accessToken = generateAccessToken({
//       userId: user._id.toString(),
//       sessionId: session._id.toString(),
//       roles: user.roles,
//     });

//     const refreshTokenStr = generateRefreshToken({
//       userId: user._id.toString(),
//       sessionId: session._id.toString(),
//     });

//     const refreshTokenHash = hash(refreshTokenStr);

//     // Update session with real hash
//     session.refreshTokenHash = refreshTokenHash;
//     await session.save();

//     // Save in RefreshToken collection
//     await RefreshToken.create({
//       userId: user._id,
//       token: refreshTokenHash,
//       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//     });

//     return res.status(200).json(
//       successResponse("Login successful", {
//         user: {
//           id: user._id,
//           phone: user.phone,
//           email: user.email,
//           roles: user.roles,
//         },
//         accessToken,
//         refreshToken: refreshTokenStr,
//         sessionId: session._id,
//       }),
//     );
//   } catch (error: any) {
//     console.error("Verify OTP Error:", error);
//     return res.status(500).json(errorResponse("Verification failed", 500));
//   }
// };

// // ====================== GET SESSIONS ======================
// Refresh Token

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { countryCode, phoneNumber, otp, deviceInfo } = req.body;

    const validation = normalizePhone(countryCode, phoneNumber);

    if (!validation.success) {
      return res.status(400).json(errorResponse(validation.message!, 400));
    }

    const {
      identifier,
      countryCode: normalizedCode,
      nationalNumber,
    } = validation;

    const otpRecord = await Otp.findOne({
      identifier,
      purpose: "login",
    });

    if (!otpRecord || otpRecord.status === "verified") {
      return res.status(400).json(errorResponse("Invalid or expired OTP", 400));
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return res
        .status(429)
        .json(errorResponse("Too many attempts. Try again later.", 429));
    }

    const isValid = compareHash(otp, otpRecord.otpHash);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json(errorResponse("Invalid OTP", 400));
    }

    // Mark OTP as verified
    otpRecord.status = "verified";
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    let user = await User.findOne({
      "phone.countryCode": normalizedCode,
      "phone.number": nationalNumber,
    });

    if (!user) {
      return res.status(404).json(errorResponse("User not found", 404));
    }

    user.phone.verified = true;
    user.lastLoginAt = new Date();
    await user.save();

    // Create Session
    const deviceId = deviceInfo?.deviceId || generateSecureToken(12);

    const session = new Session({
      userId: user._id,
      deviceId,
      deviceName: deviceInfo?.deviceName,
      deviceType: deviceInfo?.deviceType || "unknown",
      platform: deviceInfo?.platform,
      os: deviceInfo?.os,
      browser: deviceInfo?.browser,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      refreshTokenHash: "temp",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await session.save();

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      roles: user.roles,
    });

    const refreshTokenStr = generateRefreshToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
    });

    const refreshTokenHash = hash(refreshTokenStr);

    session.refreshTokenHash = refreshTokenHash;
    await session.save();

    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Set HttpOnly Cookie for Web (Next.js)
    res.cookie("refreshToken", refreshTokenStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json(
      successResponse("Login successful", {
        user: {
          id: user._id,
          phone: user.phone,
          email: user.email,
          roles: user.roles,
        },
        accessToken, // Short-lived - safe to return
        sessionId: session._id,
        // refreshToken NOT sent in body for better security
      }),
    );
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json(errorResponse("Verification failed", 500));
  }
};
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json(errorResponse("Refresh token required", 400));

    const refreshTokenHash = hash(refreshToken);
    const tokenDoc = await RefreshToken.findOne({ token: refreshTokenHash });

    if (!tokenDoc)
      return res.status(401).json(errorResponse("Invalid refresh token", 401));

    const session = await Session.findById(tokenDoc.userId); // Note: better to store sessionId in RefreshToken later
    if (!session || session.status !== "active") {
      return res.status(401).json(errorResponse("Session expired", 401));
    }

    const user = await User.findById(session.userId);
    if (!user)
      return res.status(404).json(errorResponse("User not found", 404));

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
      roles: user.roles,
    });

    const newRefreshTokenStr = generateRefreshToken({
      userId: user._id.toString(),
      sessionId: session._id.toString(),
    });

    const newHash = hash(newRefreshTokenStr);

    tokenDoc.token = newHash;
    tokenDoc.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await tokenDoc.save();

    session.refreshTokenHash = newHash;
    await session.save();

    return res.json(
      successResponse("Token refreshed", {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenStr,
      }),
    );
  } catch (error: any) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json(errorResponse("Failed to refresh token", 500));
  }
};

// Logout current device
export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId;
    if (sessionId) {
      await Session.findByIdAndUpdate(sessionId, {
        status: "revoked",
        revokedAt: new Date(),
      });
    }
    return res.json(successResponse("Logged out successfully"));
  } catch (error) {
    return res.status(500).json(errorResponse("Logout failed", 500));
  }
};

// Logout from all devices
export const logoutAll = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (userId) {
      await Session.updateMany(
        { userId, status: "active" },
        { status: "revoked", revokedAt: new Date() },
      );
    }
    return res.json(successResponse("Logged out from all devices"));
  } catch (error) {
    return res
      .status(500)
      .json(errorResponse("Failed to logout from all devices", 500));
  }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-__v");
    if (!user)
      return res.status(404).json(errorResponse("User not found", 404));

    return res.json(successResponse("User profile", { user }));
  } catch (error) {
    return res.status(500).json(errorResponse("Failed to fetch profile", 500));
  }
};

// Get active sessions
export const getSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find({
      userId: req.userId,
      status: "active",
    }).select("deviceName deviceType platform lastActivityAt expiresAt");

    return res.json(successResponse("Active sessions", { sessions }));
  } catch (error) {
    return res.status(500).json(errorResponse("Failed to fetch sessions", 500));
  }
};
