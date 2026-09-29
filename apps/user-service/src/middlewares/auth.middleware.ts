import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index";
import { errorResponse } from "../utils/response";

interface AccessPayload extends jwt.JwtPayload {
  userId: string;
  sessionId: string;
  roles: string[];
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.get("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json(errorResponse("Access token is required", 401));
  }

  const token = header.slice(7).trim();

  if (!token) {
    return res.status(401).json(errorResponse("Access token is required", 401));
  }

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret, {
      algorithms: ["HS256"],
    }) as AccessPayload;

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "string" ||
      typeof payload.sessionId !== "string"
    ) {
      return res.status(401).json(errorResponse("Invalid access token", 401));
    }

    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((r): r is string => typeof r === "string")
      : [];

    req.userId = payload.userId;
    req.sessionId = payload.sessionId;
    req.roles = roles;

    return next();
  } catch (err) {
    console.error("JWT verify failed:", err);

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json(errorResponse("Access token expired", 401));
    }

    return res
      .status(401)
      .json(errorResponse("Invalid or expired access token", 401));
  }
};

// import type { NextFunction, Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import { errorResponse } from "../utils/response";

// interface AccessPayload extends jwt.JwtPayload {
//   userId: string;
//   sessionId: string;
//   roles: string[];
//   tokenType?: string;
// }

// export const authenticate = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const header = req.get("authorization");
//   if (!header?.startsWith("Bearer ")) {
//     return res.status(401).json(errorResponse("Access token is required", 401));
//   }

//   try {
//     const payload = jwt.verify(
//       header.slice(7),
//       process.env.JWT_ACCESS_SECRET!,
//       {
//         algorithms: ["HS256"],
//         issuer: process.env.JWT_ISSUER,
//         audience: process.env.JWT_AUDIENCE,
//       },
//     ) as AccessPayload;

//     if (
//       !payload.userId ||
//       !payload.sessionId ||
//       payload.tokenType === "refresh"
//     ) {
//       return res.status(401).json(errorResponse("Invalid access token", 401));
//     }

//     req.userId = payload.userId;
//     req.sessionId = payload.sessionId;
//     req.roles = payload.roles ?? [];
//     next();
//   } catch {
//     return res
//       .status(401)
//       .json(errorResponse("Invalid or expired access token", 401));
//   }
// };
