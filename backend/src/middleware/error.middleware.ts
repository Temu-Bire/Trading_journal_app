import type {Request, Response, NextFunction} from 'express';
import  {ApiError} from '../utils/apiError.js';
import { ZodError } from "zod";
export const errorMiddleware = (
  error: unknown,
  _req: Request,
    res: Response,
    _next: NextFunction,
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
  }
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
        message: error.message,
    });
    return;
  }
  res.status(500).json({
    success: false,
    message:'Internal server error',
  });
};
