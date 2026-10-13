import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { getUserByIdService } from "../services/user.service.js";
import { ApiError } from "../utils/apiError.js";

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

    if (!req.user?.userId) {
      throw new ApiError(401, "Authentication required");
    }

    const user = await getUserByIdService(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
