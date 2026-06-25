import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  phone: string;
  email?: string;

  role: "customer" | "provider" | "admin";

  authProvider: "phone" | "google" | "apple";

  isPhoneVerified: boolean;
  isEmailVerified: boolean;

  status: "active" | "suspended" | "blocked";

  lastLoginAt?: Date;
  lastLoginIp?: string;

  refreshTokenVersion: number;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },

    authProvider: {
      type: String,
      enum: ["phone", "google", "apple"],
      default: "phone",
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "suspended", "blocked"],
      default: "active",
    },

    lastLoginAt: Date,

    lastLoginIp: String,

    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
