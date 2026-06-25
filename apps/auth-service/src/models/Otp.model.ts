import mongoose, { Document } from "mongoose";

export interface IOtp extends Document {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  purpose: "login" | "signup";
}

const otpSchema = new mongoose.Schema<IOtp>(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    purpose: {
      type: String,
      enum: ["login", "signup"],
      default: "login",
    },
  },
  {
    timestamps: true,
  },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>("Otp", otpSchema);
