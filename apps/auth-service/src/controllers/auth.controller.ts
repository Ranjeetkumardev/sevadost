import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
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
import { clearRefreshCookie, setRefreshCookie } from "../utils/cookies";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const REFRESH_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const issueSessionTokens = async (user: any, session: any) => {
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    sessionId: session._id.toString(),
    roles: user.roles,
  });
  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    sessionId: session._id.toString(),
  });
  return { accessToken, refreshToken, refreshTokenHash: hash(refreshToken) };
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { countryCode, phoneNumber } = req.body;
    const validation = normalizePhone(countryCode, phoneNumber);
    if (!validation.success) {
      return res.status(400).json(errorResponse(validation.message!, 400));
    }

    const { identifier, countryCode: code, nationalNumber } = validation;
    await User.updateOne(
      { "phone.countryCode": code, "phone.number": nationalNumber },
      {
        $setOnInsert: {
          phone: { countryCode: code, number: nationalNumber, verified: false },
          primaryRole: "customer",
          roles: ["customer"],
          status: "active",
        },
      },
      { upsert: true },
    );

    const otpCode = generateNumericOtp(6);
  console.log(`[sendOtp] Generated OTP: ${otpCode}`);

    await Otp.findOneAndUpdate(
      { identifier, purpose: "login" },
      {
        $set: {
          identifierType: "phone",
          otpHash: hash(otpCode),
          status: "pending",
          expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
          attempts: 0,
          maxAttempts: MAX_OTP_ATTEMPTS,
          verifiedAt: null,
          ipAddress: req.ip,
          userAgent: req.get("user-agent") ?? null,
        },
      },
      { upsert: true, new: true },
    );

    // Send otpCode through notification-service. Never log it in production.
    return res
      .status(200)
      .json(successResponse("OTP sent successfully", { identifier }));
  } catch (error) {
    console.error("[sendOtp]", error);
    return res.status(500).json(errorResponse("Failed to send OTP", 500));
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { countryCode, phoneNumber, otp, deviceInfo } = req.body;
    const validation = normalizePhone(countryCode, phoneNumber);
    if (!validation.success || !/^\d{6}$/.test(String(otp ?? ""))) {
      return res
        .status(400)
        .json(errorResponse("Invalid verification request", 400));
    }

    const { identifier, countryCode: code, nationalNumber } = validation;
    const record = await Otp.findOne({ identifier, purpose: "login" });
    if (
      !record ||
      record.status !== "pending" ||
      record.expiresAt <= new Date()
    ) {
      return res.status(400).json(errorResponse("Invalid or expired OTP", 400));
    }
    if (record.attempts >= record.maxAttempts) {
      return res
        .status(429)
        .json(errorResponse("Too many attempts. Request a new OTP.", 429));
    }
    if (!compareHash(String(otp), record.otpHash)) {
      await Otp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
      return res.status(400).json(errorResponse("Invalid OTP", 400));
    }

    const user = await User.findOne({
      "phone.countryCode": code,
      "phone.number": nationalNumber,
    });
    if (!user || user.status !== "active") {
      return res.status(403).json(errorResponse("Account is unavailable", 403));
    }

    record.status = "verified";
    record.verifiedAt = new Date();
    await record.save();

    user.phone.verified = true;
    user.lastLoginAt = new Date();
    await user.save();

    const session = await Session.create({
      userId: user._id,
      deviceId: deviceInfo?.deviceId || generateSecureToken(12),
      deviceName: deviceInfo?.deviceName,
      deviceType: deviceInfo?.deviceType || "unknown",
      platform: deviceInfo?.platform,
      os: deviceInfo?.os,
      browser: deviceInfo?.browser,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      refreshTokenHash: "pending",
      status: "active",
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    });

    const tokens = await issueSessionTokens(user, session);
    session.refreshTokenHash = tokens.refreshTokenHash;
    await session.save();
    await RefreshToken.create({
      userId: user._id,
      sessionId: session._id,
      tokenHash: tokens.refreshTokenHash,
      status: "active",
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    });

    setRefreshCookie(res, tokens.refreshToken);
    return res.status(200).json(
      successResponse("Login successful", {
        user: {
          id: user._id,
          phone: user.phone,
          email: user.email,
          roles: user.roles,
        },
        accessToken: tokens.accessToken,
        sessionId: session._id,
      }),
    );
  } catch (error) {
    console.error("[verifyOtp]", error);
    return res.status(500).json(errorResponse("Verification failed", 500));
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const rawToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!rawToken)
      return res.status(401).json(errorResponse("Refresh token required", 401));

    const oldHash = hash(rawToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash: oldHash });
    if (
      !tokenDoc ||
      tokenDoc.status !== "active" ||
      tokenDoc.expiresAt <= new Date()
    ) {
      clearRefreshCookie(res);
      return res
        .status(401)
        .json(errorResponse("Invalid or expired refresh token", 401));
    }

    const session = await Session.findOne({
      _id: tokenDoc.sessionId,
      userId: tokenDoc.userId,
      status: "active",
      expiresAt: { $gt: new Date() },
    });
    if (!session) {
      tokenDoc.status = "revoked";
      tokenDoc.revokedAt = new Date();
      await tokenDoc.save();
      clearRefreshCookie(res);
      return res.status(401).json(errorResponse("Session expired", 401));
    }

    const user = await User.findOne({ _id: tokenDoc.userId, status: "active" });
    if (!user)
      return res.status(401).json(errorResponse("Account is unavailable", 401));

    const tokens = await issueSessionTokens(user, session);
    tokenDoc.status = "rotated";
    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedByTokenHash = tokens.refreshTokenHash;
    await tokenDoc.save();

    await RefreshToken.create({
      userId: user._id,
      sessionId: session._id,
      tokenHash: tokens.refreshTokenHash,
      status: "active",
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    });
    session.refreshTokenHash = tokens.refreshTokenHash;
    session.lastActivityAt = new Date();
    await session.save();

    setRefreshCookie(res, tokens.refreshToken);
    return res.json(
      successResponse("Token refreshed", { accessToken: tokens.accessToken }),
    );
  } catch (error) {
    console.error("[refreshToken]", error);
    return res.status(500).json(errorResponse("Failed to refresh token", 500));
  }
};

export const getMe = async (req: Request, res: Response) => {
  const user = await User.findById(req.userId).select(
    "phone email primaryRole roles status lastLoginAt",
  );
  if (!user) return res.status(404).json(errorResponse("User not found", 404));
  return res.json(successResponse("Auth identity", { user }));
};

export const getSessions = async (req: Request, res: Response) => {
  const sessions = await Session.find({
    userId: req.userId,
    status: "active",
    expiresAt: { $gt: new Date() },
  })
    .select(
      "deviceId deviceName deviceType platform os browser ipAddress lastActivityAt expiresAt createdAt",
    )
    .sort({ lastActivityAt: -1 });
  return res.json(
    successResponse("Active sessions", {
      sessions: sessions.map((session) => ({
        ...session.toObject(),
        isCurrent: session.id === req.sessionId,
      })),
    }),
  );
};

export const revokeSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!isValidObjectId(sessionId))
    return res.status(400).json(errorResponse("Invalid session ID", 400));
  const session = await Session.findOneAndUpdate(
    { _id: sessionId, userId: req.userId, status: "active" },
    { status: "revoked", revokedAt: new Date() },
    { new: true },
  );
  if (!session)
    return res.status(404).json(errorResponse("Active session not found", 404));
  await RefreshToken.updateMany(
    { sessionId: session._id, status: "active" },
    { status: "revoked", revokedAt: new Date() },
  );
  if (session.id === req.sessionId) clearRefreshCookie(res);
  return res.json(successResponse("Session revoked"));
};

export const logout = async (req: Request, res: Response) => {
  if (req.sessionId) {
    await Promise.all([
      Session.updateOne(
        { _id: req.sessionId, userId: req.userId },
        { status: "revoked", revokedAt: new Date() },
      ),
      RefreshToken.updateMany(
        { sessionId: req.sessionId, status: "active" },
        { status: "revoked", revokedAt: new Date() },
      ),
    ]);
  }
  clearRefreshCookie(res);
  return res.json(successResponse("Logged out successfully"));
};

export const logoutAll = async (req: Request, res: Response) => {
  await Promise.all([
    Session.updateMany(
      { userId: req.userId, status: "active" },
      { status: "revoked", revokedAt: new Date() },
    ),
    RefreshToken.updateMany(
      { userId: req.userId, status: "active" },
      { status: "revoked", revokedAt: new Date() },
    ),
  ]);
  clearRefreshCookie(res);
  return res.json(successResponse("Logged out from all devices"));
};

// import { Request, Response } from "express";
// import { User } from "../models/User.model";
// import { Otp } from "../models/Otp.model";
// import { Session } from "../models/Session.model";
// import { RefreshToken } from "../models/RefreshToken.model";

// import {
//   hash,
//   compareHash,
//   generateSecureToken,
//   generateNumericOtp,
// } from "../utils/crypto";
// import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
// import { normalizePhone } from "../validators/auth.validator";
// import { successResponse, errorResponse } from "../utils/response";

// const OTP_EXPIRY_MINUTES = 10;
// const MAX_OTP_ATTEMPTS = 5;

// export const sendOtp = async (req: Request, res: Response) => {
//   try {
//     const { countryCode, phoneNumber, purpose = "login" } = req.body;

//     const validation = normalizePhone(countryCode, phoneNumber);
//     if (!validation.success) {
//       console.log("[Send OTP] Validation failed:", validation.message);
//       return res.status(400).json(errorResponse(validation.message!, 400));
//     }

//     const {
//       identifier,
//       countryCode: normalizedCode,
//       nationalNumber,
//     } = validation;

//     // Find or create user
//     let user = await User.findOne({
//       "phone.countryCode": normalizedCode,
//       "phone.number": nationalNumber,
//     });

//     if (!user) {
//       user = new User({
//         phone: {
//           countryCode: normalizedCode,
//           number: nationalNumber,
//           verified: false,
//         },
//         primaryRole: "customer",
//         roles: ["customer"],
//         status: "active",
//       });
//       await user.save();
//       console.log("[Send OTP] New user created");
//     }

//     const otpCode = generateNumericOtp(6);
//     const otpHash = hash(otpCode);

//     console.log(`[Send OTP] Generated OTP: ${otpCode} (hash saved)`);

//     const savedOtp = await Otp.findOneAndUpdate(
//       { identifier, purpose: "login" },
//       {
//         identifier,
//         identifierType: "phone",
//         purpose: "login",
//         otpHash,
//         status: "pending",
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//         attempts: 0,
//       },
//       { upsert: true, new: true },
//     );

//     // console.log("[Send OTP] OTP saved successfully:", savedOtp?._id);

//     return res
//       .status(200)
//       .json(successResponse("OTP sent successfully", { identifier }));
//   } catch (error: any) {
//     console.error("[Send OTP] Error:", error);
//     return res.status(500).json(errorResponse("Failed to send OTP", 500));
//   }
// };

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

//     let user = await User.findOne({
//       "phone.countryCode": normalizedCode,
//       "phone.number": nationalNumber,
//     });

//     if (!user) {
//       return res.status(404).json(errorResponse("User not found", 404));
//     }

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
//       refreshTokenHash: "temp",
//       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//     });

//     await session.save();

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

//     session.refreshTokenHash = refreshTokenHash;
//     await session.save();

//     await RefreshToken.create({
//       userId: user._id,
//       token: refreshTokenHash,
//       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//     });

//     // Set HttpOnly Cookie for Web (Next.js)
//     res.cookie("refreshToken", refreshTokenStr, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//     });

//     return res.status(200).json(
//       successResponse("Login successful", {
//         user: {
//           id: user._id,
//           phone: user.phone,
//           email: user.email,
//           roles: user.roles,
//         },
//         accessToken, // Short-lived - safe to return
//         sessionId: session._id,
//         // refreshToken NOT sent in body for better security
//       }),
//     );
//   } catch (error: any) {
//     console.error("Verify OTP Error:", error);
//     return res.status(500).json(errorResponse("Verification failed", 500));
//   }
// };
// export const refreshToken = async (req: Request, res: Response) => {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken)
//       return res.status(400).json(errorResponse("Refresh token required", 400));

//     const refreshTokenHash = hash(refreshToken);
//     const tokenDoc = await RefreshToken.findOne({ token: refreshTokenHash });

//     if (!tokenDoc)
//       return res.status(401).json(errorResponse("Invalid refresh token", 401));

//     const session = await Session.findById(tokenDoc.userId); // Note: better to store sessionId in RefreshToken later
//     if (!session || session.status !== "active") {
//       return res.status(401).json(errorResponse("Session expired", 401));
//     }

//     const user = await User.findById(session.userId);
//     if (!user)
//       return res.status(404).json(errorResponse("User not found", 404));

//     const newAccessToken = generateAccessToken({
//       userId: user._id.toString(),
//       sessionId: session._id.toString(),
//       roles: user.roles,
//     });

//     const newRefreshTokenStr = generateRefreshToken({
//       userId: user._id.toString(),
//       sessionId: session._id.toString(),
//     });

//     const newHash = hash(newRefreshTokenStr);

//     tokenDoc.token = newHash;
//     tokenDoc.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
//     await tokenDoc.save();

//     session.refreshTokenHash = newHash;
//     await session.save();

//     return res.json(
//       successResponse("Token refreshed", {
//         accessToken: newAccessToken,
//         refreshToken: newRefreshTokenStr,
//       }),
//     );
//   } catch (error: any) {
//     console.error("Refresh Token Error:", error);
//     return res.status(500).json(errorResponse("Failed to refresh token", 500));
//   }
// };

// // Logout current device
// export const logout = async (req: Request, res: Response) => {
//   try {
//     const sessionId = req.sessionId;
//     if (sessionId) {
//       await Session.findByIdAndUpdate(sessionId, {
//         status: "revoked",
//         revokedAt: new Date(),
//       });
//     }
//     return res.json(successResponse("Logged out successfully"));
//   } catch (error) {
//     return res.status(500).json(errorResponse("Logout failed", 500));
//   }
// };

// // Logout from all devices
// export const logoutAll = async (req: Request, res: Response) => {
//   try {
//     const userId = req.userId;
//     if (userId) {
//       await Session.updateMany(
//         { userId, status: "active" },
//         { status: "revoked", revokedAt: new Date() },
//       );
//     }
//     return res.json(successResponse("Logged out from all devices"));
//   } catch (error) {
//     return res
//       .status(500)
//       .json(errorResponse("Failed to logout from all devices", 500));
//   }
// };

// // Get current user
// export const getMe = async (req: Request, res: Response) => {
//   try {
//     const user = await User.findById(req.userId).select("-__v");
//     if (!user)
//       return res.status(404).json(errorResponse("User not found", 404));

//     return res.json(successResponse("User profile", { user }));
//   } catch (error) {
//     return res.status(500).json(errorResponse("Failed to fetch profile", 500));
//   }
// };

// // Get active sessions
// export const getSessions = async (req: Request, res: Response) => {
//   try {
//     const sessions = await Session.find({
//       userId: req.userId,
//       status: "active",
//     }).select("deviceName deviceType platform lastActivityAt expiresAt");

//     return res.json(successResponse("Active sessions", { sessions }));
//   } catch (error) {
//     return res.status(500).json(errorResponse("Failed to fetch sessions", 500));
//   }
// };
