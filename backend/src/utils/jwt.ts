import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AccessTokenPayload } from "../modules/auth/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export const generateAccessToken = (
  payload: AccessTokenPayload,
): string => {
  return jwt.sign(payload, env.jwtSecret, {
      ...(env.jwtExpiresIn !== undefined && {
        expiresIn: env.jwtExpiresIn as NonNullable<jwt.SignOptions["expiresIn"]>,
      }),
  });
};

export const verifyAccessToken = (
  token: string,
): AccessTokenPayload => {
  return jwt.verify(
    token,
    env.jwtSecret,
  ) as AccessTokenPayload;
};