import { userRepository } from "../users/user.repository.js"; // Repositoryው ገብቷል
import type { LoginInput } from "./auth.types.js";
import { verifyPassword } from "../../utils/password.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/apiError.js";

export const loginUser = async (data: LoginInput) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const user = await userRepository.findByEmailWithPassword(normalizedEmail);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 3. Compare password
  const passwordMatches = await verifyPassword(data.password, user.password);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 4. Create Access and Refresh Tokens
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
  });

  // 5. Return authentication result
  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};