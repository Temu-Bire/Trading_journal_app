import { userRepository } from "../users/user.repository.js";
import type { LoginInput } from "../users/user.types.js";
import { verifyPassword } from "../../utils/password.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/apiError.js";

export const loginUser = async (data: LoginInput) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const user = await userRepository.findByEmailWithPassword(normalizedEmail);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const passwordMatches = await verifyPassword(data.password, user.password);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid credentials");
  }

  const userId = String(user._id);

  const accessToken = generateAccessToken({
    userId,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
    },
  };
};