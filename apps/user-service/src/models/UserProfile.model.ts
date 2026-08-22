import mongoose, { Document, model, Schema } from "mongoose";

export interface IUserProfile extends Document {
  authUserId: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  avatar?: { mediaId: string; url: string } | null;
  bio?: string;
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    marketingNotifications: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
  };
  profileCompleted: boolean;
  completionPercentage: number;
  deletedAt?: Date | null;
}

const profileSchema = new Schema<IUserProfile>(
  {
    authUserId: { type: String, required: true, unique: true, immutable: true },
    firstName: { type: String, trim: true, maxlength: 60 },
    lastName: { type: String, trim: true, maxlength: 60 },
    displayName: { type: String, trim: true, maxlength: 100 },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    avatar: {
      mediaId: { type: String, trim: true },
      url: { type: String, trim: true },
    },
    bio: { type: String, trim: true, maxlength: 500 },
    preferences: {
      language: { type: String, default: "en" },
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
      marketingNotifications: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
    },
    profileCompleted: { type: Boolean, default: false },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, strict: true },
);

profileSchema.index({ authUserId: 1, deletedAt: 1 });

export const UserProfile = model<IUserProfile>("UserProfile", profileSchema);

 