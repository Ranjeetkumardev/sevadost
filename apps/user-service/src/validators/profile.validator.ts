import { z } from "zod";

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(50).optional(),
    lastName: z.string().trim().min(1).max(50).optional(),
    displayName: z.string().trim().min(1).max(50).optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
    bio: z.string().trim().max(500).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
      .optional(),
  })
  .strict();

export const preferencesSchema = z
  .object({
    language: z.string().trim().min(2).max(10).optional(),
    currency: z.string().trim().length(3).optional(),
    timezone: z.string().trim().max(64).optional(),
    marketingEmails: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
  })
  .strict();

export const avatarSchema = z
  .object({
    mediaId: z.string().trim().min(1).max(128),
    url: z.string().url().max(2048),
  })
  .strict();

const coordinatesSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

export const createAddressSchema = z
  .object({
    label: z.string().trim().min(1).max(30).optional(),
    line1: z.string().trim().min(1).max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(1).max(20),
    country: z.string().trim().length(2),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
      .optional(),
    isDefault: z.boolean().optional(),
    coordinates: coordinatesSchema.optional(),
  })
  .strict();

export const updateAddressSchema = createAddressSchema.partial();
