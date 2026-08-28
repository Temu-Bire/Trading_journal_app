import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  userId: string;
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