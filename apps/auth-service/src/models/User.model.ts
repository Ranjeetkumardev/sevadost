import { InferSchemaType, Schema, model } from "mongoose";
import { USER_ROLE, USER_STATUS } from "../constants/auth.constants";

const userSchema = new Schema(
  {
    phone: {
      countryCode: {
        type: String,
        required: true,
        trim: true,
      },

      number: {
        type: String,
        required: true,
        trim: true,
      },

      verified: {
        type: Boolean,
        default: false,
      },
    },

    email: {
      address: {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
      },

      verified: {
        type: Boolean,
        default: false,
      },
    },

    primaryRole: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.CUSTOMER,
      required: true,
    },

    roles: {
      type: [
        {
          type: String,
          enum: Object.values(USER_ROLE),
        },
      ],
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

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

userSchema.index(
  {
    "phone.countryCode": 1,
    "phone.number": 1,
  },
  {
    unique: true,
  },
);

userSchema.index(
  {
    "email.address": 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

userSchema.index({
  roles: 1,
});

userSchema.index({
  status: 1,
});

export type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);

// import mongoose, { Document } from "mongoose";

// export interface IUser extends Document {
//   phone: string;
//   email?: string;

//   role: "customer" | "provider" | "admin";

//   authProvider: "phone" | "google" | "apple";

//   isPhoneVerified: boolean;
//   isEmailVerified: boolean;

//   status: "active" | "suspended" | "blocked";

//   lastLoginAt?: Date;
//   lastLoginIp?: string;

//   refreshTokenVersion: number;
// }

// const userSchema = new mongoose.Schema<IUser>(
//   {
//     phone: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       lowercase: true,
//       trim: true,
//       sparse: true,
//     },

//     role: {
//       type: String,
//       enum: ["customer", "provider", "admin"],
//       default: "customer",
//     },

//     authProvider: {
//       type: String,
//       enum: ["phone", "google", "apple"],
//       default: "phone",
//     },

//     isPhoneVerified: {
//       type: Boolean,
//       default: false,
//     },

//     isEmailVerified: {
//       type: Boolean,
//       default: false,
//     },

//     status: {
//       type: String,
//       enum: ["active", "suspended", "blocked"],
//       default: "active",
//     },

//     lastLoginAt: Date,

//     lastLoginIp: String,

//     refreshTokenVersion: {
//       type: Number,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// export const User = mongoose.model<IUser>("User", userSchema);
