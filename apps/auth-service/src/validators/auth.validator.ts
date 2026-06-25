import validator from "validator";

export const validatePhone = (phone: string) => {
  const cleanedPhone = phone.replace(/\D/g, "");

  if (!cleanedPhone) {
    return {
      valid: false,
      message: "Phone number is required",
    };
  }

  if (!validator.isMobilePhone(cleanedPhone, "en-IN")) {
    return {
      valid: false,
      message: "Invalid phone number",
    };
  }

  return {
    valid: true,
  };
};

export const validateOtp = (otp: string) => {
  if (!otp) {
    return {
      valid: false,
      message: "OTP is required",
    };
  }

  if (!/^\d{6}$/.test(otp)) {
    return {
      valid: false,
      message: "Invalid OTP",
    };
  }

  return {
    valid: true,
  };
};
