import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validate = (
  schema: ZodType,
  target: "body" | "query" | "params" = "body"
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      if (target === "body") {
        req.body = parsed;
      } else if (target === "query") {
        try {
          (req as any).query = parsed;
        } catch {
          Object.defineProperty(req, "query", {
            value: parsed,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      } else if (target === "params") {
        req.params = parsed as any;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};