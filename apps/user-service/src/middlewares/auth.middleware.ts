import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response";

interface AccessPayload extends jwt.JwtPayload {
  userId: string;
  sessionId: string;
  roles: string[];
  tokenType?: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json(errorResponse("Access token is required", 401));
  }

  try {
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_ACCESS_SECRET!,
      {
        algorithms: ["HS256"],
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      },
    ) as AccessPayload;

    if (
      !payload.userId ||
      !payload.sessionId ||
      payload.tokenType === "refresh"
    ) {
      return res.status(401).json(errorResponse("Invalid access token", 401));
    }

    req.userId = payload.userId;
    req.sessionId = payload.sessionId;
    req.roles = payload.roles ?? [];
    next();
  } catch {
    return res
      .status(401)
      .json(errorResponse("Invalid or expired access token", 401));
  }
};

// import { Request, Response, NextFunction } from "express";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         role: string;
//       };
//     }
//   }
// }

// export const authMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

//   const userId =
//     req.headers["x-user-id"];

//   const role =
//     req.headers["x-user-role"];

//   if (!userId) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized",
//     });
//   }

//   req.user = {
//     id: String(userId),
//     role: String(role),
//   };

//   next();
// };
