import type { Request, Response, NextFunction } from "express";
import { createUser,getCurrentUser} from "./user.service.js";
import { ApiError } from "../../utils/apiError.js";

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
export const getCurrentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new ApiError(401, "Authentication required"));
    }

    const user = await getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};