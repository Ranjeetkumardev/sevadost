import crypto from "crypto";

/**
 * Generates SHA-256 hash.
 */
export const hash = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

/**
 * Constant-time comparison.
 */
export const compareHash = (
  value: string,
  hashedValue: string
): boolean => {
  const currentHash = hash(value);

  return crypto.timingSafeEqual(
    Buffer.from(currentHash),
    Buffer.from(hashedValue)
  );
};

/**
 * Secure random string.
 */
export const generateSecureToken = (
  bytes = 32
): string => {
  return crypto.randomBytes(bytes).toString("hex");
};

/**
 * Secure numeric OTP.
 */
export const generateNumericOtp = (
  length = 6
): string => {

  const min = 10 ** (length - 1);

  const max = (10 ** length) - 1;

  return crypto
    .randomInt(min, max + 1)
    .toString();
};