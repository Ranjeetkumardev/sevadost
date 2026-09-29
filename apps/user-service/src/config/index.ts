import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET environment variable is not set");
}

export const config = {
  env: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 4002,

  mongoUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/sevadost-user",

  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:4001",

  jwt: {
    accessSecret: ACCESS_SECRET,
  },
};
