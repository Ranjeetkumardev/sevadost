import { Document, Schema, model } from "mongoose";

export interface IEmergencyContact extends Document {
  authUserId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
  deletedAt?: Date | null;
}

const emergencyContactSchema = new Schema<IEmergencyContact>(
  {
    authUserId: {
      type: String,
      required: true,
      index: true,
      immutable: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    relationship: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  },
);

emergencyContactSchema.index({
  authUserId: 1,
  deletedAt: 1,
});

export const EmergencyContact = model<IEmergencyContact>(
  "EmergencyContact",
  emergencyContactSchema,
);