import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 4002,

  mongoUri:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/sevadost-user",

  authServiceUrl:
    process.env.AUTH_SERVICE_URL ||
    "http://localhost:4001",
};