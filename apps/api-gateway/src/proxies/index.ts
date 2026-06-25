import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 4000,

  services: {
    auth: process.env.AUTH_SERVICE_URL!,
    user: process.env.USER_SERVICE_URL!,
    provider: process.env.PROVIDER_SERVICE_URL!,
    booking: process.env.BOOKING_SERVICE_URL!,
    payment: process.env.PAYMENT_SERVICE_URL!,
  },
};
