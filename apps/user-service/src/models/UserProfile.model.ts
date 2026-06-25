import mongoose, { Document } from "mongoose";

export interface IUserProfile extends Document {
  authUserId: string;

  fullName: string;

  profileImage?: string;

  preferredLanguage: string;

  onboardingStep: number;

  profileCompleted: boolean;

  lastActiveAt?: Date;
}

const userProfileSchema =
  new mongoose.Schema<IUserProfile>(
    {
      authUserId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      fullName: {
        type: String,
        default: "",
        trim: true,
      },

      profileImage: {
        type: String,
        default: null,
      },

      preferredLanguage: {
        type: String,
        default: "en",
      },

      onboardingStep: {
        type: Number,
        default: 0,
      },

      profileCompleted: {
        type: Boolean,
        default: false,
      },

      lastActiveAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

export const UserProfile =
  mongoose.model<IUserProfile>(
    "UserProfile",
    userProfileSchema
  );