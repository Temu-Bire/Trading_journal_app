import type { Request, Response, NextFunction } from "express";
import { userRepository } from "./user.repository.js";
import { ApiError } from "../../utils/apiError.js";

export const getUserByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      throw new ApiError(400, "Valid User ID is required");
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