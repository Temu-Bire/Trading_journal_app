import { User } from "../users/user.model.js";
import type { LoginInput } from "./auth.types.js";
import { verifyPassword } from "../../utils/password.js";
import { generateAccessToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/apiError.js";

export const loginUser = async (data: LoginInput) => {
  // 1. Find user by email
  const user = await User.findOne({
    email: data.email,
  }).select("+password");

  // 2. User doesn't exist
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 3. Compare password
  const passwordMatches = await verifyPassword(
    data.password,
    user.password,
  );

  // 4. Password is incorrect
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 5. Create JWT
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
  });

  // 6. Return authentication result
  return {
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};