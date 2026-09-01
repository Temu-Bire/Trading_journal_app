import type { Request, Response, NextFunction } from "express";
import { loginUser, registerUser, refreshAccessToken, getCurrentUser } from "./auth.service.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";

const isProduction = env.nodeEnv === "production";

// የ Cookie አማራጮች (Cookie Options)
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("strict" as const) : ("lax" as const),
  path: "/api/v1/auth/refresh", // Refresh Token የሚላከው ለዚህ route ብቻ ነው
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("strict" as const) : ("lax" as const),
  path: "/",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken, user } = await registerUser(req.body);

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken, user } = await loginUser(req.body);

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, "Refresh token required");
    }

    const { accessToken } = await refreshAccessToken(refreshToken);

    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getMeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};