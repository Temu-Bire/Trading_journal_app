import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "./auth.middleware.js";
import { generateAccessToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

describe("Auth Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      cookies: {},
    };
    mockRes = {};
    next = jest.fn() as unknown as NextFunction;
  });

  it("should authenticate via Bearer token in Authorization header", () => {
    const payload = {
      userId: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      role: "user" as const,
    };
    const validToken = generateAccessToken(payload);

    mockReq.headers = {
      authorization: `Bearer ${validToken}`,
    };

    authenticate(mockReq as Request, mockRes as Response, next);

    expect(mockReq.user?.userId).toBe(payload.userId);
    expect(mockReq.user?.email).toBe(payload.email);
    expect(mockReq.user?.role).toBe(payload.role);
    expect(next).toHaveBeenCalledWith();
  });

  it("should authenticate via accessToken cookie", () => {
    const payload = {
      userId: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      role: "user" as const,
    };
    const validToken = generateAccessToken(payload);

    mockReq.cookies = {
      accessToken: validToken,
    };

    authenticate(mockReq as Request, mockRes as Response, next);

    expect(mockReq.user?.userId).toBe(payload.userId);
    expect(mockReq.user?.email).toBe(payload.email);
    expect(next).toHaveBeenCalledWith();
  });

  it("should pass 401 ApiError to next when no token is provided", () => {
    authenticate(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (next as unknown as jest.Mock).mock.calls[0]![0] as ApiError;
    expect(error.statusCode).toBe(401);
  });

  it("should pass 401 when token is expired", () => {
    const expiredToken = jwt.sign(
      { userId: "123", email: "test@example.com", role: "user" },
      env.jwtSecret,
      { expiresIn: "-1s" }
    );

    mockReq.headers = {
      authorization: `Bearer ${expiredToken}`,
    };

    authenticate(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (next as unknown as jest.Mock).mock.calls[0]![0] as ApiError;
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain("Token has expired");
  });

  it("should pass 401 when token is invalid", () => {
    mockReq.headers = {
      authorization: "Bearer invalid_signature_or_malformed_token",
    };

    authenticate(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (next as unknown as jest.Mock).mock.calls[0]![0] as ApiError;
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain("Invalid token");
  });
});
