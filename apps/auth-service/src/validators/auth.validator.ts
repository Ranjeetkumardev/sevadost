import { parsePhoneNumberFromString } from "libphonenumber-js";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export interface PhoneValidationResult extends ValidationResult {
  identifier?: string;
  countryCode?: string;
  nationalNumber?: string;
}

export const normalizePhone = (
  countryCode: string,
  phoneNumber: string
): PhoneValidationResult => {
  try {
    if (!countryCode?.trim()) {
      return {
        success: false,
        message: "Country code is required.",
      };
    }

    if (!phoneNumber?.trim()) {
      return {
        success: false,
        message: "Phone number is required.",
      };
    }

    const phone = parsePhoneNumberFromString(
      `${countryCode}${phoneNumber}`
    );

    if (!phone || !phone.isValid()) {
      return {
        success: false,
        message: "Invalid phone number.",
      };
    }

    return {
      success: true,
      identifier: phone.number,
      countryCode: `+${phone.countryCallingCode}`,
      nationalNumber: phone.nationalNumber,
    };
  } catch {
    return {
      success: false,
      message: "Invalid phone number.",
    };
  }
};

export const validateSendOtp = (
  body: any
): ValidationResult => {
  if (!body) {
    return {
      success: false,
      message: "Request body is required.",
    };
  }

  if (!body.countryCode) {
    return {
      success: false,
      message: "Country code is required.",
    };
  }

  if (!body.phoneNumber) {
    return {
      success: false,
      message: "Phone number is required.",
    };
  }

  return {
    success: true,
  };
};

export const validateVerifyOtp = (
  body: any
): ValidationResult => {
  if (!body) {
    return {
      success: false,
      message: "Request body is required.",
    };
  }

  if (!body.countryCode) {
    return {
      success: false,
      message: "Country code is required.",
    };
  }

  if (!body.phoneNumber) {
    return {
      success: false,
      message: "Phone number is required.",
    };
  }

  if (!body.otp) {
    return {
      success: false,
      message: "OTP is required.",
    };
  }

  if (!/^\d{6}$/.test(body.otp)) {
    return {
      success: false,
      message: "Invalid OTP.",
    };
  }

  return {
    success: true,
  };
};