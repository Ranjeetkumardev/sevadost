import validator from "validator";

export const sanitizePhone = (phone: unknown): string => {
  if (typeof phone !== "string") return "";

  return validator.escape(phone.trim());
};

export const sanitizeEmail = (email: unknown): string => {
  if (typeof email !== "string") return "";

  return validator.normalizeEmail(email.trim()) || "";
};

export const sanitizeString = (value: unknown): string => {
  if (typeof value !== "string") return "";

  return validator.escape(value.trim());
};
