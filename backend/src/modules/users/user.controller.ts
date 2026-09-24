import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { userRepository } from "./user.repository.js";
import { ApiError } from "../../utils/apiError.js";

export const getUserByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Valid User ID is required");
    }

    // Ownership check: user can only view their own profile unless role is admin
    if (req.user?.userId !== id && req.user?.role !== "admin") {
      throw new ApiError(403, "Access denied: you can only view your own profile");
    }

    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};