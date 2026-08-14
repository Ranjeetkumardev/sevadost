import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().min(1).max(max).optional();

export const updateProfileSchema = z
  .object({
    firstName: optionalText(60),
    lastName: optionalText(60),
    displayName: optionalText(100),
    dateOfBirth: z.coerce.date().max(new Date()).optional(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
    bio: z.string().trim().max(500).optional(),
  })
  .strict();

export const preferencesSchema = z
  .object({
    language: z.string().trim().min(2).max(10).optional(),
    currency: z
      .string()
      .trim()
      .length(3)
      .transform((v: string) => v.toUpperCase())
      .optional(),
    timezone: z.string().trim().min(1).max(60).optional(),
    marketingNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data: Record<string, unknown>) => Object.keys(data).length > 0,
    "At least one preference is required",
  );

export const avatarSchema = z
  .object({
    mediaId: z.string().trim().min(1).max(200),
    url: z.string().url().max(2048),
  })
  .strict();

const coordinatesSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

export const createAddressSchema = z
  .object({
    label: z.enum(["home", "work", "other"]).default("home"),
    recipientName: z.string().trim().min(1).max(100),
    phoneNumber: z.string().trim().min(7).max(20).optional(),
    line1: z.string().trim().min(1).max(200),
    line2: z.string().trim().max(200).optional(),
    landmark: z.string().trim().max(150).optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(3).max(20),
    countryCode: z
      .string()
      .trim()
      .length(2)
      .transform((v: string) => v.toUpperCase()),
    coordinates: coordinatesSchema.optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const updateAddressSchema = createAddressSchema
  .partial()
  .refine(
    (data: Record<string, unknown>) => Object.keys(data).length > 0,
    "At least one address field is required",
  );

// export const validateProfileUpdate = (
//   body: any
// ) => {
//   const errors: string[] = [];

//   if (
//     body.fullName &&
//     body.fullName.length > 100
//   ) {
//     errors.push(
//       "Full name cannot exceed 100 characters"
//     );
//   }

//   if (
//     body.preferredLanguage &&
//     body.preferredLanguage.length > 10
//   ) {
//     errors.push(
//       "Invalid language"
//     );
//   }

//   return {
//     valid: errors.length === 0,
//     errors,
//   };
// };
