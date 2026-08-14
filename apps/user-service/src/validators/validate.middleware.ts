import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { errorResponse } from "../utils/response";

export const validateBody =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json(
          errorResponse(
            result.error.issues
              .map((issue: { message: string }) => issue.message)
              .join(", "),
            400,
          ),
        );
    }
    req.body = result.data;
    next();
  };

export const validateQuery =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res
        .status(400)
        .json(
          errorResponse(
            result.error.issues
              .map((issue: { message: string }) => issue.message)
              .join(", "),
            400,
          ),
        );
    }
    req.query = result.data as unknown as Record<string, string>;
    next();
  };

export const validateParams =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res
        .status(400)
        .json(
          errorResponse(
            result.error.issues
              .map((issue: { message: string }) => issue.message)
              .join(", "),
            400,
          ),
        );
    }
    req.params = result.data as Record<string, string>;
    next();
  };
