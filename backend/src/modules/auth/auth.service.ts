import { userRepository } from "../users/user.repository.js";
import type { CreateUserInput, LoginInput } from "../users/user.types.js";
import { verifyPassword } from "../../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/apiError.js";
import type { ForgotPasswordInput, ResetPasswordInput } from "./auth.schema.js";

export const registerUser = async (data: CreateUserInput) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existingUser = await userRepository.findByEmailWithPassword(normalizedEmail);
  if (existingUser) {
    throw new ApiError(400, "Email is already registered");
  }

  const newUser = await userRepository.create({
    name: data.name,
    email: normalizedEmail,
    password: data.password,
  });

  const userId = String(newUser._id);

  const accessToken = generateAccessToken({ userId, email: newUser.email });
  const refreshToken = generateRefreshToken({ userId });

  return {
    accessToken,
    refreshToken,
    user: {
      id: userId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

export const loginUser = async (data: LoginInput) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const user = await userRepository.findByEmailWithPassword(normalizedEmail);
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled. Contact support.");
  }

  if (user.isLocked) {
    const remainingMinutes = Math.ceil(
      (user.lockUntil!.getTime() - Date.now()) / (1000 * 60)
    );
    throw new ApiError(
      423,
      `Account is temporarily locked. Try again in ${remainingMinutes} minute(s)`
    );
  }

  const passwordMatches = await verifyPassword(data.password, user.password);

  if (!passwordMatches) {
    // የተሳሳተ ሙከራን በ Repository በኩል መዝግቦ መጨመር
    await userRepository.incrementLoginAttempts(user);
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.loginAttempts > 0 || user.lockUntil) {
    await userRepository.resetLoginAttempts(user);
  }

  const userId = String(user._id);

  const accessToken = generateAccessToken({ userId, email: user.email});
  const refreshToken = generateRefreshToken({ userId });

  return {
    accessToken,
    refreshToken,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const user = await userRepository.findById(payload.userId);
  if (!user || !user.isActive) {
    throw new ApiError(401, "User not found or inactive");
  }

  const newAccessToken = generateAccessToken({
    userId: String(user._id),
    email: user.email,
  });

  return { accessToken: newAccessToken };
};

export const getCurrentUser = async (userId: string) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const forgotPasswordService = async (data: ForgotPasswordInput) => {
  const normalizedEmail = data.email.toLowerCase().trim();
  const user = await userRepository.findByEmailWithPassword(normalizedEmail);

  if (!user) {
    return;
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `https://yourdomain.com/reset-password?token=${resetToken}`;

  try {
    
    console.log(`Reset Token for ${user.email}: ${resetToken}`);
  } catch (error) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "There was an error sending the email. Try again later.");
  }
};

export const resetPasswordService = async (data: ResetPasswordInput) => {
  const user = await userRepository.findByResetToken(data.token);

  if (!user) {
    throw new ApiError(400, "Token is invalid or has expired");
  }

  user.password = data.newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  user.loginAttempts = 0;
  user.lockUntil = null;

  await user.save();
};