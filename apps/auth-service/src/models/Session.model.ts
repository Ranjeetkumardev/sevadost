import { Document, Schema, model } from "mongoose";
import {
  SESSION_STATUS,
  DEVICE_TYPE,
  type SessionStatus,
  type DeviceType,
} from "../constants/auth.constants";

export interface ISession extends Document {
  userId: Schema.Types.ObjectId;
  deviceId: string;
  deviceName?: string;
  deviceType: DeviceType;
  platform?: string;
  os?: string;
  browser?: string;
  appVersion?: string;
  ipAddress?: string;
  userAgent?: string;
  refreshTokenHash: string;
  status: SessionStatus;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokedReason?: string;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceId: { type: String, required: true, trim: true },
    deviceName: { type: String, default: null, trim: true },
    deviceType: {
      type: String,
      enum: Object.values(DEVICE_TYPE),
      default: DEVICE_TYPE.UNKNOWN,
    },
    platform: { type: String, default: null, trim: true },
    os: { type: String, default: null, trim: true },
    browser: { type: String, default: null, trim: true },
    appVersion: { type: String, default: null, trim: true },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    refreshTokenHash: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.ACTIVE,
    },
    lastActivityAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, default: null, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
    strict: true,
  },
);

sessionSchema.index({ userId: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ userId: 1, deviceId: 1 });

export const Session = model<ISession>("Session", sessionSchema);
export default Session; 

// import { InferSchemaType, Schema, model } from "mongoose";
// import { SESSION_STATUS } from "../constants/auth.constants";

// const sessionSchema = new Schema(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     deviceId: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     deviceName: {
//       type: String,
//       default: null,
//       trim: true,
//     },

//     deviceType: {
//       type: String,
//       enum: ["mobile", "tablet", "desktop", "web", "unknown"],
//       default: "unknown",
//     },

//     platform: {
//       type: String,
//       default: null,
//       trim: true,
//     },

//     os: {
//       type: String,
//       default: null,
//       trim: true,
//     },

//     browser: {
//       type: String,
//       default: null,
//       trim: true,
//     },

//     appVersion: {
//       type: String,
//       default: null,
//       trim: true,
//     },

//     ipAddress: {
//       type: String,
//       default: null,
//     },

//     userAgent: {
//       type: String,
//       default: null,
//     },

//     refreshTokenHash: {
//       type: String,
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: Object.values(SESSION_STATUS),
//       default: SESSION_STATUS.ACTIVE,
//     },

//     lastActivityAt: {
//       type: Date,
//       default: Date.now,
//     },

//     expiresAt: {
//       type: Date,
//       required: true,
//     },

//     revokedAt: {
//       type: Date,
//       default: null,
//     },

//     revokedReason: {
//       type: String,
//       default: null,
//       trim: true,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//     minimize: false,
//     strict: true,
//   }
// );

// sessionSchema.index({ userId: 1 });

// sessionSchema.index({ status: 1 });

// sessionSchema.index({ expiresAt: 1 });

// sessionSchema.index({
//   userId: 1,
//   deviceId: 1,
// });

// export type Session = InferSchemaType<typeof sessionSchema>;

// export default model("Session", sessionSchema);
