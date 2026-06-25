import { Router } from "express";

import healthRoute from "./health.routes";
import authRoute from "./auth.routes";

const router = Router();

router.use("/api-gateway", healthRoute);

router.use("/auth", authRoute);

export default router;