import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import routes from "./routes";

import { config } from "./config";
import { connectDB } from "./config/database";

const start = async () => {
  mongoose.set("sanitizeFilter", true);
  await connectDB();

  const app = express();

  app.use(helmet());

  app.use(cors());

  app.use(compression());

  app.use(express.json());

  app.use("/api/v1/auth", routes);

  app.listen(config.port, () => {
    console.log(`Auth Service running on ${config.port}`);
  });
};

start();
