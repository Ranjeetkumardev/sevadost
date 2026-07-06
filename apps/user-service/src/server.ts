import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import routes from ".//routes/profile.route";

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

  app.use("/api/v1/users", routes);

  app.listen(config.port, () => {
    console.log(`User Service running on ${config.port}`);
  });
};

start();
