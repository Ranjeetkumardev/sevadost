import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 4001,

  mongoUri: process.env.MONGODB_URI!,

  jwt: {
    accessSecret: process.env.ACCESS_SECRET!,
    refreshSecret: process.env.REFRESH_SECRET!,

    accessExpiry: process.env.ACCESS_EXPIRES_IN || "15m",

    refreshExpiry: process.env.REFRESH_EXPIRES_IN || "30d",
  },
};
