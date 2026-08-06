import { Router } from "express";
import { SERVICES } from "../config/services";
import { createServiceProxy } from "../proxies/createProxy";

const router = Router();
// Temporary health check for gateway
router.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "healthy",
    proxies: Object.values(SERVICES).map((s) => ({ name: s.name, url: s.url })),
  });
});

Object.values(SERVICES).forEach((service) => {
  // console.log(
  //   `Setting up proxy for ${service.name} at ${service.route} -> ${service.url}`,
  // );
  router.use(
    service.route,
    createServiceProxy(service.url, service.name, service.rewrite),
  );
});
export default router;
