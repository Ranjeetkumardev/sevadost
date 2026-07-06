import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

import { correlationId } from "./middlewares";
import { rateLimiter } from "./middlewares/rateLimit.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

import { config, logger } from "./config/index";
// import healthRoutes from "./routes/health.routes";
import gatewayRoutes from "./routes/index";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.use(correlationId);
app.use(rateLimiter);

app.use("/api/v1", gatewayRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`API Gateway running on port ${config.port}`);
});
