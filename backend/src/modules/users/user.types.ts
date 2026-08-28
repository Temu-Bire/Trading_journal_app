import type { UserRole } from "./user.model.js";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}