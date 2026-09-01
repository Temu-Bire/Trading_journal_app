import { User } from "./user.model.js";
import type { CreateUserInput } from "./user.types.js";

export const userRepository = {
  async create(data: CreateUserInput) {
    return await User.create(data);
  },

  async findByEmailWithPassword(email: string) {
    return await User.findOne({ email }).select("+password");
  },

  async findById(id: string) {
    return await User.findById(id).select("-password");
  },
};