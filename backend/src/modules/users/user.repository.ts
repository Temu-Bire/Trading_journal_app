import { User } from "./user.model.js";
import type { IUser } from "./user.model.js";

export class UserRepository {
  async findByEmailWithPassword(email: string) {
    return await User.findOne({ email }).select("+password");
  }

  async findById(id: string) {
    return await User.findById(id);
  }

  
  async create(userData: Partial<IUser>) {
    return await User.create(userData);
  }
}

export const userRepository = new UserRepository();