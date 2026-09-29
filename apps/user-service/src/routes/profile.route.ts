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
import {
  getProfile,
  updateProfile,
  getCompletion,
  updatePreferences,
  setAvatar,
  removeAvatar,
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  removeAddress,
  requestAccountDeletion,
} from "../controllers/profile.controller";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ service: "user-service", status: "healthy" }),
);

router.get("/profile", authenticate, getProfile);
router.patch(
  "/profile/update",
  authenticate,
  validateBody(updateProfileSchema),
  updateProfile,
);
router.get("/profile/completion", authenticate, getCompletion);
router.patch(
  "/profile/preferences",
  authenticate,
  validateBody(preferencesSchema),
  updatePreferences,
);

router.put(
  "/profile/avatar",
  authenticate,
  validateBody(avatarSchema),
  setAvatar,
);
router.delete("/profile/avatar", authenticate, removeAvatar);

router.get("/addresses", authenticate, getAddresses);
router.post(
  "/addresses",
  authenticate,
  validateBody(createAddressSchema),
  createAddress,
);
router.patch(
  "/addresses/:addressId",
  authenticate,
  validateBody(updateAddressSchema),
  updateAddress,
);
router.patch("/addresses/:addressId/default", authenticate, setDefaultAddress);
router.delete("/addresses/:addressId", authenticate, removeAddress);

router.post("/account/deletion-request", authenticate, requestAccountDeletion);

export default router;

// import { Router } from "express";
// import { authenticate } from "../middlewares/auth.middleware";
// import { validateBody } from "../validators/validate.middleware";
// import {
//   avatarSchema,
//   createAddressSchema,
//   preferencesSchema,
//   updateAddressSchema,
//   updateProfileSchema,
// } from "../validators/profile.validator";
// import * as controller from "../controllers/profile.controller";

// const router = Router();

// router.get("/health", (_req, res) =>
//   res.json({ service: "user-service", status: "healthy" }),
// );

// router.get("/get-profile", controller.getProfile);
// router.patch(
//   "/update-profile",
//   validateBody(updateProfileSchema),
//   controller.patchProfile,
// );
// router.get("/compelete-profile/completion", controller.getCompletion);
// router.patch(
//   "/profile/preferences",
//   validateBody(preferencesSchema),
//   controller.patchPreferences,
// );
// router.put("/profile/avatar", validateBody(avatarSchema), controller.putAvatar);
// router.delete("/profile/avatar", controller.removeAvatar);
// router.get("/addresses", controller.getAddresses);
// router.post(
//   "/addresses",
//   validateBody(createAddressSchema),
//   controller.postAddress,
// );
// router.patch(
//   "/addresses/:addressId",
//   validateBody(updateAddressSchema),
//   controller.patchAddress,
// );
// router.patch("/addresses/:addressId/default", controller.setDefaultAddress);
// router.delete("/addresses/:addressId", controller.removeAddress);
// router.post("/account/deletion-request", controller.requestAccountDeletion);

// export default router;
