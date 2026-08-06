import { Document, Schema, model } from "mongoose";
import {
  OTP_PURPOSE,
  OTP_STATUS,
  type OtpPurpose,
  type OtpStatus,
} from "../constants/auth.constants";

export interface IOtp extends Document {
  identifier: string;
  identifierType: "phone" | "email";
  purpose: OtpPurpose;
  otpHash: string;
  status: OtpStatus;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  verifiedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

const otpSchema = new Schema<IOtp>(
  {
    identifier: { type: String, required: true, trim: true, lowercase: true },
    identifierType: { type: String, enum: ["phone", "email"], required: true },
    purpose: { type: String, enum: Object.values(OTP_PURPOSE), required: true },
    otpHash: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(OTP_STATUS),
      default: OTP_STATUS.PENDING,
    },
    attempts: { type: Number, default: 0, min: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true},
    verifiedAt: { type: Date, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
    strict: true,
  },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ identifier: 1, purpose: 1 });

export const Otp = model<IOtp>("Otp", otpSchema);
export default Otp;
