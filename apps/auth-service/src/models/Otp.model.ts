import { InferSchemaType, Schema, model } from "mongoose";
import { OTP_PURPOSE, OTP_STATUS } from "../constants/auth.constants";

const otpSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    identifierType: {
      type: String,
      enum: ["phone", "email"],
      required: true,
    },
    purpose: {
      type: String,
      enum: Object.values(OTP_PURPOSE),
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(OTP_STATUS),
      default: OTP_STATUS.PENDING,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
    strict: true,
  },
);

/**
 * MongoDB TTL Index
 * Automatically deletes expired OTPs.
 */
otpSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  },
);

/**
 * Only one active OTP per identifier + purpose.
 */
otpSchema.index({
  identifier: 1,
  purpose: 1,
});

export type Otp = InferSchemaType<typeof otpSchema>;

export default model<Otp>("Otp", otpSchema);
