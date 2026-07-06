import { Router } from "express";
import { SERVICES } from "../config/services";
import { createServiceProxy } from "../proxies/createProxy";

const router = Router();

Object.values(SERVICES).forEach((service) => {
    //  console.log(`Setting up proxy for ${service.name} at ${service.route} -> ${service.url}`);
  router.use(
    service.route,
    createServiceProxy(
      service.url,
      service.name,
      service.rewrite
    )
  );
});

export default router;

// import { Router } from "express";

// import healthRoute from "./health.routes";
// import authRoute from "./auth.routes";

// const router = Router();

// router.use("/api-gateway", healthRoute);

// router.use("/auth", authRoute);

// export default router;
