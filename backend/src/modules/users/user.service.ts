import { User } from "./user.model.js";
import { ApiError } from "../../utils/apiError.js";
import { hashPassword } from "../../utils/password.js";
import type { CreateUserInput } from "./user.types.js";

export const createUser = async (data: CreateUserInput) => {
  // 1. Check if email already exists
  const existingUser = await User.findOne({
    email: data.email,
  });

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  // 2. Hash password
  const hashedPassword = await hashPassword(data.password);

  // 3. Create user
  const user = await User.create({
    ...data,
    password: hashedPassword,
  });

  // 4. Remove sensitive information
  const { password: _password, ...safeUser } = user.toObject();

  // 5. Return safe user
  return safeUser;
};
export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};