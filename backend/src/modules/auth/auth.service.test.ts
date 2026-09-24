import { jest } from "@jest/globals";
import { userRepository } from "../users/user.repository.js";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
} from "./auth.service.js";
import { hashPassword } from "../../utils/password.js";
import { generateRefreshToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/apiError.js";

describe("Auth Service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      const mockUserInput = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      };

      jest.spyOn(userRepository, "findByEmailWithPassword").mockResolvedValue(null);
      jest.spyOn(userRepository, "create").mockResolvedValue({
        _id: "507f1f77bcf86cd799439011" as any,
        name: mockUserInput.name,
        email: mockUserInput.email,
        role: "user" as const,
      } as any);

      const result = await registerUser(mockUserInput);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user).toEqual({
        id: "507f1f77bcf86cd799439011",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      });
    });

    it("should throw ApiError(400) if email already exists", async () => {
      jest
        .spyOn(userRepository, "findByEmailWithPassword")
        .mockResolvedValue({ _id: "existing_id" } as any);

      await expect(
        registerUser({
          name: "Existing",
          email: "existing@example.com",
          password: "Password123!",
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe("loginUser", () => {
    it("should successfully log in with valid credentials and reset login attempts", async () => {
      const rawPassword = "Password123!";
      const hashedPassword = await hashPassword(rawPassword);

      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "user" as const,
        isActive: true,
        isLocked: false,
        loginAttempts: 2,
        lockUntil: null,
      };

      jest.spyOn(userRepository, "findByEmailWithPassword").mockResolvedValue(mockUser as any);
      const resetSpy = jest.spyOn(userRepository, "resetLoginAttempts").mockResolvedValue(mockUser as any);

      const result = await loginUser({
        email: "test@example.com",
        password: rawPassword,
      });

      expect(resetSpy).toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw ApiError(401) on non-existent user", async () => {
      jest.spyOn(userRepository, "findByEmailWithPassword").mockResolvedValue(null);

      await expect(
        loginUser({ email: "nobody@example.com", password: "Password123!" })
      ).rejects.toThrow(ApiError);
    });

    it("should throw ApiError(403) if user is inactive", async () => {
      const inactiveUser = {
        _id: "inactive_id",
        email: "inactive@example.com",
        isActive: false,
      };
      jest.spyOn(userRepository, "findByEmailWithPassword").mockResolvedValue(inactiveUser as any);

      await expect(
        loginUser({ email: "inactive@example.com", password: "Password123!" })
      ).rejects.toThrow("Account is disabled");
    });

    it("should throw ApiError(423) if user is locked", async () => {
      const lockedUser = {
        _id: "locked_id",
        email: "locked@example.com",
        isActive: true,
        isLocked: true,
        lockUntil: new Date(Date.now() + 15 * 60 * 1000),
      };
      jest.spyOn(userRepository, "findByEmailWithPassword").mockResolvedValue(lockedUser as any);

      await expect(
        loginUser({ email: "locked@example.com", password: "Password123!" })
      ).rejects.toThrow("Account is temporarily locked");
    });

    it("should increment login attempts and throw ApiError(401) on invalid password", async () => {
      const hashedPassword = await hashPassword("RealPassword123!");
      const mockUser = {
        _id: "user_id",
        email: "test@example.com",
        password: hashedPassword,
        isActive: true,
        isLocked: false,
        loginAttempts: 0,
        lockUntil: null,
      };
      jest.spyOn(userRepository, "findByEmailWithPassword").mockResolvedValue(mockUser as any);
      const incSpy = jest.spyOn(userRepository, "incrementLoginAttempts").mockResolvedValue(mockUser as any);

      await expect(
        loginUser({ email: "test@example.com", password: "WrongPassword!" })
      ).rejects.toThrow("Invalid credentials");

      expect(incSpy).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("refreshAccessToken", () => {
    it("should issue a new access token for valid refresh token", async () => {
      const userId = "507f1f77bcf86cd799439011";
      const validRefreshToken = generateRefreshToken({ userId });

      const mockUser = {
        _id: userId,
        email: "user@example.com",
        role: "user" as const,
        isActive: true,
      };

      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);

      const result = await refreshAccessToken(validRefreshToken);
      expect(result).toHaveProperty("accessToken");
    });

    it("should throw ApiError(401) if user is inactive or not found during refresh", async () => {
      const validRefreshToken = generateRefreshToken({ userId: "unknown_id" });
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);

      await expect(refreshAccessToken(validRefreshToken)).rejects.toThrow("User not found or inactive");
    });
  });

  describe("getCurrentUser", () => {
    it("should return sanitized user profile", async () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        name: "Current User",
        email: "current@example.com",
        role: "user" as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);

      const result = await getCurrentUser(mockUser._id);
      expect(result.id).toBe(mockUser._id);
      expect(result.name).toBe("Current User");
    });

    it("should throw ApiError(404) if user not found", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(null);
      await expect(getCurrentUser("non_existent")).rejects.toThrow("User not found");
    });
  });
});
