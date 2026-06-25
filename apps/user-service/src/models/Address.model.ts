import mongoose, { Document } from "mongoose";

export interface IAddress extends Document {
  authUserId: string;

  label: string;

  addressLine1: string;

  addressLine2?: string;

  city: string;

  state: string;

  pincode: string;

  location: {
    type: string;
    coordinates: number[];
  };

  isDefault: boolean;
}

const addressSchema = new mongoose.Schema<IAddress>(
  {
    authUserId: {
      type: String,
      required: true,
      index: true,
    },

    label: {
      type: String,
      required: true,
    },

    addressLine1: {
      type: String,
      required: true,
    },

    addressLine2: {
      type: String,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

addressSchema.index({
  location: "2dsphere",
});

export const Address = mongoose.model<IAddress>("Address", addressSchema);
