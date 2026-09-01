import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AccessTokenPayload, RefreshTokenPayload } from "../modules/auth/auth.types.js";

// generate Access Token 
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

//verify Access Token 
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
};

// generate Refresh Token 
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

// verify Refresh Token
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
};