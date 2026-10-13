import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (env.nodeEnv !== "test") {
    console.error(error);
  }

  // 1. Zod schema validation errors
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

  // 2. Custom application ApiError
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // 3. Mongoose CastError (e.g., malformed ObjectId)
  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid identifier format for ${error.path}: ${error.value}`,
    });
    return;
  }

  // 4. Mongoose Schema Validation Error
  if (error instanceof mongoose.Error.ValidationError) {
    const errorDetails = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
    res.status(400).json({
      success: false,
      message: "Database validation failed",
      errors: errorDetails,
    });
    return;
  }

  // 5. MongoDB duplicate key error (E11000)
  const isMongoDuplicate =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000;

  if (isMongoDuplicate) {
    const keyPattern = (error as { keyPattern?: Record<string, unknown> }).keyPattern;
    const duplicatedFields = keyPattern ? Object.keys(keyPattern).join(", ") : "field";
    res.status(409).json({
      success: false,
      message: `Duplicate value entered for ${duplicatedFields}. Please choose a unique value.`,
    });
    return;
  }

  // 6. Malformed JSON Body
  if (error instanceof SyntaxError && "status" in error && (error as { status: unknown }).status === 400) {
    res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body",
    });
    return;
  }

  // 7. JWT Authentication errors
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

  // 8. Default Internal Server Error
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};