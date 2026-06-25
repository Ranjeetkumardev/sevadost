import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 4001,

  mongoUri: process.env.MONGODB_URI!,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,

    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",

    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  },
};
