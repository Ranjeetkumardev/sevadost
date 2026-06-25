import { Request, Response, NextFunction } from "express";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO:
  // Validate JWT with Auth Service

  next();
};