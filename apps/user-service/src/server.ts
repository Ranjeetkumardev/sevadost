import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import profileRoutes from "./routes/profile.route";
import { connectDB } from "./config/database";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS ?? "").split(",").filter(Boolean),
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "32kb" }));
app.use("/", profileRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(Number(process.env.PORT ?? 3002), () =>
    console.log("User service started"),
  );
};

start();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import compression from "compression";
// import mongoose from "mongoose";
// import routes from ".//routes/profile.route";

// import { config } from "./config";
// import { connectDB } from "./config/database";

// const start = async () => {
//   mongoose.set("sanitizeFilter", true);
//   await connectDB();

//   const app = express();

//   app.use(helmet());

//   app.use(cors());

//   app.use(compression());

//   app.use(express.json());

//   app.use("/api/v1/users", routes);

//   app.listen(config.port, () => {
//     console.log(`User Service running on ${config.port}`);
//   });
// };

// start();
