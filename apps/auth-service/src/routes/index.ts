import { Router } from "express";
import authRoute from "./auth.routes";

const router = Router();

router.use("/", authRoute);

export default router;