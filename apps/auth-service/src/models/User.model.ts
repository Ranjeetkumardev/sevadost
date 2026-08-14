import { Document, Schema, model } from "mongoose";
import {
  USER_ROLE,
  USER_STATUS,
  type UserRole,
  type UserStatus,
} from "../constants/auth.constants";

export interface IUser extends Document {
  phone: {
    countryCode: string;
    number: string;
    verified: boolean;
  };
  email?: {
    address?: string;
    verified: boolean;
  };
  primaryRole: UserRole;
  roles: UserRole[];
  status: UserStatus;
  lastLoginAt?: Date;
  lastSeenAt?: Date;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    phone: {
      countryCode: { type: String, required: true, trim: true },
      number: { type: String, required: true, trim: true },
      verified: { type: Boolean, default: false },
    },

    email: {
      address: { type: String, trim: true, lowercase: true },
      verified: { type: Boolean, default: false },
    },
    primaryRole: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.CUSTOMER,
      required: true,
    },

    roles: {
      type: [{ type: String, enum: Object.values(USER_ROLE) }],
      default: [USER_ROLE.CUSTOMER],
    },

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
      required: true,
    },

    lastLoginAt: Date,
    lastSeenAt: Date,

    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: true, // Keeps empty/undefined fields out of MongoDB
    strict: true,
  },
);

// Indexes
userSchema.index(
  { "phone.countryCode": 1, "phone.number": 1 },
  { unique: true },
);
// userSchema.index({ "email.address": 1 }, { unique: true, sparse: true });
userSchema.index({ roles: 1 });
userSchema.index({ status: 1 });

export const User = model<IUser>("User", userSchema);
export default User;
 