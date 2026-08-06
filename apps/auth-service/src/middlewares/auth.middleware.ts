import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { Session } from "../models/Session.model";
import { errorResponse } from "../utils/response";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionId?: string;
      roles?: string[];
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(errorResponse("Access token is required", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res
        .status(401)
        .json(errorResponse("Invalid or expired token", 401));
    }

    // Check if session is still active
    const session = await Session.findById(decoded.sessionId);
    if (!session || session.status !== "active") {
      return res
        .status(401)
        .json(
          errorResponse("Session has been revoked. Please login again.", 401),
        );
    }

    req.userId = decoded.userId;
    req.sessionId = decoded.sessionId;
    req.roles = decoded.roles;

    next();
  } catch (error) {
    console.error("[Auth Middleware] Error:", error);
    return res.status(401).json(errorResponse("Authentication failed", 401));
  }
};
