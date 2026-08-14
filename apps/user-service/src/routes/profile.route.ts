import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validateBody } from "../validators/validate.middleware";
import {
  avatarSchema,
  createAddressSchema,
  preferencesSchema,
  updateAddressSchema,
  updateProfileSchema,
} from "../validators/profile.validator";
import * as controller from "../controllers/profile.controller";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ service: "user-service", status: "healthy" }),
);
router.use(authenticate);
router.get("/profile", controller.getProfile);
router.patch(
  "/profile",
  validateBody(updateProfileSchema),
  controller.patchProfile,
);
router.get("/profile/completion", controller.getCompletion);
router.patch(
  "/profile/preferences",
  validateBody(preferencesSchema),
  controller.patchPreferences,
);
router.put("/profile/avatar", validateBody(avatarSchema), controller.putAvatar);
router.delete("/profile/avatar", controller.removeAvatar);
router.get("/addresses", controller.getAddresses);
router.post(
  "/addresses",
  validateBody(createAddressSchema),
  controller.postAddress,
);
router.patch(
  "/addresses/:addressId",
  validateBody(updateAddressSchema),
  controller.patchAddress,
);
router.patch("/addresses/:addressId/default", controller.setDefaultAddress);
router.delete("/addresses/:addressId", controller.removeAddress);
router.post("/account/deletion-request", controller.requestAccountDeletion);

export default router;

// import { Router } from "express";

// import {
//   getProfile,
//   createProfile,
//   updateProfile,
// } from "../controllers/profile.controller";

// import {
//   authMiddleware,
// } from "../middlewares/auth.middleware";

// const router = Router();

// router.get("/health", (req, res) => {
//    console.log("Health check for user-service");
//   res.status(200).json({
//     service: "user-service",
//     status: "healthy",
//   });
// });
// router.post(
//   "/",
//   authMiddleware,
//   createProfile
// );

// router.get(
//   "/me",
//   authMiddleware,
//   getProfile
// );

// router.patch(
//   "/me",
//   authMiddleware,
//   updateProfile
// );

// export default router;
