import { userRepository } from "../repository/user.repository.js";
import { ApiError } from "../utils/apiError.js";

export const getUserByIdService = async (
  targetUserId: string,
  requestingUserId: string,
  requestingUserRole?: string
) => {
  if (requestingUserId !== targetUserId && requestingUserRole !== "admin") {
    throw new ApiError(403, "Access denied: you can only view your own profile");
  }

  const user = await userRepository.findById(targetUserId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};
