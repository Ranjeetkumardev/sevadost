import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { config } from "../config/index";

const ACCESS_SECRET = config.jwt.accessSecret;
const REFRESH_SECRET = config.jwt.refreshSecret;

if (!ACCESS_SECRET) {
  throw new Error("ACCESS_SECRET environment variable is not set");
}

if (!REFRESH_SECRET) {
  throw new Error("REFRESH_SECRET environment variable is not set");
}

const ACCESS_EXPIRES_IN = config.jwt.accessExpiry;
const REFRESH_EXPIRES_IN = config.jwt.refreshExpiry;
export interface AccessTokenPayload {
  userId: string;
  sessionId: string;
  roles: string[];
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
    algorithm: "HS256",
  } as SignOptions);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (
  token: string,
): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): JwtPayload | string | null => {
  return jwt.decode(token);
};
