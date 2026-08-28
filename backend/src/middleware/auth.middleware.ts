import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new ApiError(401, "Authentication required");
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Invalid authorization header");
    }

    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};