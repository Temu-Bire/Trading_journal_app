import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";


const { JsonWebTokenError, TokenExpiredError } = jwt;

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(error);

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: "Access token expired",
    });
    return;
  }

  if (error instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};