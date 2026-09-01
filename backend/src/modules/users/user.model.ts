import mongoose, { Document, Model, Schema } from "mongoose";
import { hashPassword } from "../../utils/password.js";

export type UserRole = "user" | "admin";

// 1. Interface Document 
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  loginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual Property
  isLocked: boolean;
  
  // Custom Instance Methods
  incLoginAttempts(): Promise<IUser>;
  resetLoginAttempts(): Promise<IUser>;
}

// 2. Schema Definition
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// 3. Virtual Property 
userSchema.virtual("isLocked").get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// 4. Pre-save Hook 
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await hashPassword(this.password);
});

// 5. Custom Methods - Lockout Logic
userSchema.methods.incLoginAttempts = async function (this: IUser) {
  
  if (this.lockUntil && this.lockUntil < new Date()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates: Record<string, unknown> = {
    $inc: { loginAttempts: 1 },
  };

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 30 * 60 * 1000; 

  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }

  return await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function (this: IUser) {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

export const User = mongoose.model<IUser>("User", userSchema);