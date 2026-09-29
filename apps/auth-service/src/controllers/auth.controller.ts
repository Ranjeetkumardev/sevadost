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

 