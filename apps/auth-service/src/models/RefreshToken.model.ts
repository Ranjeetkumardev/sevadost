import { Document, Schema, model } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Schema.Types.ObjectId;
  sessionId: Schema.Types.ObjectId;
  tokenHash: string;
  status: "active" | "revoked" | "rotated";
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedByTokenHash?: string | null;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    tokenHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "revoked", "rotated"],
      default: "active",
      required: true,
    },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ sessionId: 1, status: 1 });
refreshTokenSchema.index({ userId: 1, status: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
);

// import { Document, Schema, model } from "mongoose";

// export interface IRefreshToken extends Document {
//   userId: Schema.Types.ObjectId;
//   token: string;
//   expiresAt: Date;
// }

// const refreshTokenSchema = new Schema<IRefreshToken>(
//   {
//     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     token: { type: String, required: true },
//     expiresAt: { type: Date, required: true },
//   },
//   { timestamps: true },
// );

// refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// refreshTokenSchema.index({ userId: 1 });
// refreshTokenSchema.index({ token: 1 });

// export const RefreshToken = model<IRefreshToken>(
//   "RefreshToken",
//   refreshTokenSchema,
// );
// export default RefreshToken;
