import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/response";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Error:", err);

  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(errorResponse(err.message, err.statusCode));
  }

  if (err instanceof SyntaxError) {
    return res.status(400).json(errorResponse("Invalid request format", 400));
  }

  return res.status(500).json(errorResponse("Internal server error", 500));
};

export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  return res.status(404).json(errorResponse("Resource not found", 404));
};
