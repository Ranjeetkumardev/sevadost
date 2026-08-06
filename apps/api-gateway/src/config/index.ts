import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT),
  
};

export const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
