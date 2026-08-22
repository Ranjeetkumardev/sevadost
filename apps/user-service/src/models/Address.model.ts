import { Document, Schema, model } from "mongoose";

export interface IAddress extends Document {
  authUserId: string;
  label: "home" | "work" | "other";
  recipientName: string;
  phoneNumber?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  location?: { type: "Point"; coordinates: [number, number] };
  isDefault: boolean;
  deletedAt?: Date | null;
}

const addressSchema = new Schema<IAddress>(
  {
    authUserId: { type: String, required: true, index: true, immutable: true },
    label: { type: String, enum: ["home", "work", "other"], default: "home" },
    recipientName: { type: String, required: true, trim: true, maxlength: 100 },
    phoneNumber: { type: String, trim: true, maxlength: 20 },
    line1: { type: String, required: true, trim: true, maxlength: 200 },
    line2: { type: String, trim: true, maxlength: 200 },
    landmark: { type: String, trim: true, maxlength: 150 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    postalCode: { type: String, required: true, trim: true, maxlength: 20 },
    countryCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2,
    },
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: {
        type: [Number],
        validate: [
          (v: number[]) => !v?.length || v.length === 2,
          "Coordinates must be [longitude, latitude]",
        ],
      },
    },
    isDefault: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, strict: true },
);

addressSchema.index({ authUserId: 1, isDefault: 1 });
addressSchema.index({ location: "2dsphere" }, { sparse: true });

export const Address = model<IAddress>("Address", addressSchema);

 