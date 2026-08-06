import { Document, Schema, model } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ token: 1 });

export const RefreshToken = model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
);
export default RefreshToken;


// import mongoose, { Document } from "mongoose";

// export interface IRefreshToken extends Document {
//   userId: mongoose.Types.ObjectId;
//   token: string;
//   expiresAt: Date;
// }

// const refreshTokenSchema = new mongoose.Schema<IRefreshToken>(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     token: {
//       type: String,
//       required: true,
//     },

//     expiresAt: {
//       type: Date,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// refreshTokenSchema.index({ userId: 1 });

// refreshTokenSchema.index({ token: 1 });

// export const RefreshToken = mongoose.model<IRefreshToken>(
//   "RefreshToken",
//   refreshTokenSchema,
// );
