import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { errorMiddleware } from "./error.middleware.js";
import { ApiError } from "../utils/apiError.js";

describe("Error Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {};
    mockResponse = {
      status: statusMock as any,
      json: jsonMock as any,
    };
    mockNext = jest.fn();
  });

  it("should handle ZodError with 400 Bad Request and field errors", () => {
    const testSchema = z.object({ symbol: z.string().min(1) });
    let zodError: ZodError | null = null;
    try {
      testSchema.parse({ symbol: "" });
    } catch (err) {
      zodError = err as ZodError;
    }

    errorMiddleware(zodError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([expect.objectContaining({ field: "symbol" })]),
      })
    );
  });

  it("should handle ApiError with its corresponding status code and message", () => {
    const apiError = new ApiError(403, "Forbidden resource");

    errorMiddleware(apiError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden resource",
    });
  });

  it("should handle Mongoose CastError with 400 Bad Request", () => {
    const castError = new mongoose.Error.CastError("ObjectId", "invalid_id_value", "_id");

    errorMiddleware(castError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Invalid identifier format for _id: invalid_id_value",
    });
  });

  it("should handle MongoDB duplicate key error (11000) with 409 Conflict", () => {
    const mongoDuplicateError = {
      code: 11000,
      keyPattern: { email: 1 },
    };

    errorMiddleware(mongoDuplicateError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Duplicate value entered for email"),
      })
    );
  });

  it("should handle TokenExpiredError with 401 Unauthorized", () => {
    const expiredError = new jwt.TokenExpiredError("jwt expired", new Date());

    errorMiddleware(expiredError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Access token expired",
    });
  });

  it("should handle JsonWebTokenError with 401 Unauthorized", () => {
    const jwtError = new jwt.JsonWebTokenError("invalid signature");

    errorMiddleware(jwtError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Invalid access token",
    });
  });

  it("should fallback to 500 for unhandled generic errors", () => {
    const genericError = new Error("Unexpected database connection crash");

    errorMiddleware(genericError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
