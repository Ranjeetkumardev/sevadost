import { Router } from "express";
import { authProxy } from "../proxies/auth.proxy";

const router = Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working",
  });
});

router.use("/", authProxy);

export default router;