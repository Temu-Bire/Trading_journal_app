import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";
import type { AccessTokenPayload, RefreshTokenPayload } from "../modules/users/user.types.js";
import { env } from "../config/env.js";

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const secret: Secret = env.jwtSecret;
  const expiresIn = (env.jwtExpiresIn || "15m") as string;

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const secret: Secret = env.jwtRefreshSecret;
  const expiresIn = (env.jwtRefreshExpiresIn || "7d") as string;

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const secret: Secret = env.jwtSecret;
  return jwt.verify(token, secret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const secret: Secret = env.jwtRefreshSecret;
  return jwt.verify(token, secret) as RefreshTokenPayload;
};