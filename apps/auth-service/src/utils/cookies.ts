import type { CookieOptions, Response } from "express";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/v1/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const setRefreshCookie = (res: Response, token: string) =>
  res.cookie("refreshToken", token, refreshCookieOptions);

export const clearRefreshCookie = (res: Response) =>
  res.clearCookie("refreshToken", {
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
    path: refreshCookieOptions.path,
  });