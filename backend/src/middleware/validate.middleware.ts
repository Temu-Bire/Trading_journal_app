import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validate = (
  schema: ZodType,
  target: "body" | "query" | "params" = "body"
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
};