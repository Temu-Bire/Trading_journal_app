import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // 1. Token from Authorization Header or from HttpOnly Cookie 
    let token: string | undefined;

    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer ")) {
      token = authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, "Authentication required. Please log in.");
    }

    // 2. Token verification
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "Token has expired. Please refresh your token."));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Invalid token authentication failed."));
    }

    next(error);
  }
};