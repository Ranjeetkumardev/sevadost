export const USER_ROLE = {
  CUSTOMER: "customer",
  PROVIDER: "provider",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  SUPPORT: "support",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BLOCKED: "blocked",
  DELETED: "deleted",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const SESSION_STATUS = {
  ACTIVE: "active",
  REVOKED: "revoked",
  EXPIRED: "expired",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export const OTP_PURPOSE = {
  LOGIN: "login",
  REGISTER: "register",
  RESET_PASSWORD: "reset_password",
  CHANGE_PHONE: "change_phone",
  DELETE_ACCOUNT: "delete_account",
} as const;

export type OtpPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];

export const OTP_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  EXPIRED: "expired",
} as const;

export type OtpStatus = (typeof OTP_STATUS)[keyof typeof OTP_STATUS];

export const DEVICE_TYPE = {
  MOBILE: "mobile",
  TABLET: "tablet",
  DESKTOP: "desktop",
  WEB: "web",
  UNKNOWN: "unknown",
} as const;

export type DeviceType = (typeof DEVICE_TYPE)[keyof typeof DEVICE_TYPE];

// export const USER_ROLES = [
//   "CUSTOMER",
//   "PROVIDER",
//   "ADMIN",
//   "SUPER_ADMIN",
//   "SUPPORT",
// ] as const;

// export type UserRole = (typeof USER_ROLES)[number];

// export const USER_STATUS = [
//   "ACTIVE",
//   "SUSPENDED",
//   "BLOCKED",
//   "DELETED",
// ] as const;

// export type UserStatus = (typeof USER_STATUS)[number];

// export const SESSION_STATUS = [
//   "ACTIVE",
//   "REVOKED",
//   "EXPIRED",
// ] as const;

// export type SessionStatus = (typeof SESSION_STATUS)[number];

// export const OTP_PURPOSE = [
//   "LOGIN",
//   "REGISTER",
//   "RESET_PASSWORD",
//   "CHANGE_PHONE",
//   "DELETE_ACCOUNT",
// ] as const;

// export type OtpPurpose = (typeof OTP_PURPOSE)[number];

// export const OTP_STATUS = [
//   "PENDING",
//   "VERIFIED",
//   "EXPIRED",
// ] as const;

// export type OtpStatus = (typeof OTP_STATUS)[number];
