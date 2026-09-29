import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { errorResponse, successResponse } from "../utils/response";
import { Address } from "../models/Address.model";
import { UserProfile } from "../models/UserProfile.model";

export const getProfile = async (req: Request, res: Response) => {
  const authUserId = req.userId!;

  const profile = await UserProfile.findOneAndUpdate(
    { authUserId, deletedAt: null },
    { $setOnInsert: { authUserId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return res.json(successResponse("Profile fetched", { profile }));
};

export const updateProfile = async (req: Request, res: Response) => {
 
  const authUserId = req.userId!;

  const profile = await UserProfile.findOneAndUpdate(
    { authUserId, deletedAt: null },
    { $setOnInsert: { authUserId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
   console.log("Fetched profile:", profile); // Debugging line

  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  profile.set(req.body);

  const checks = [
    Boolean(profile.firstName),
    Boolean(profile.lastName),
    Boolean(profile.displayName),
    Boolean(profile.dateOfBirth),
    Boolean(profile.gender),
    Boolean(profile.avatar?.mediaId),
  ];
  const percentage = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );
  profile.set({
    completionPercentage: percentage,
    profileCompleted: percentage === 100,
  });

  const updated = await profile.save();

  return res.json(successResponse("Profile updated", { profile: updated }));
};

export const getCompletion = async (req: Request, res: Response) => {
  const authUserId = req.userId!;

  const profile = await UserProfile.findOneAndUpdate(
    { authUserId, deletedAt: null },
    { $setOnInsert: { authUserId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return res.json(
    successResponse("Profile completion fetched", {
      profileCompleted: profile?.profileCompleted,
      completionPercentage: profile?.completionPercentage,
    }),
  );
};

export const updatePreferences = async (req: Request, res: Response) => {
  const authUserId = req.userId!;

  const profile = await UserProfile.findOneAndUpdate(
    { authUserId, deletedAt: null },
    {
      $set: Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => [
          `preferences.${key}`,
          value,
        ]),
      ),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return res.json(
    successResponse("Preferences updated", {
      preferences: profile?.preferences,
    }),
  );
};

export const setAvatar = async (req: Request, res: Response) => {
  const authUserId = req.userId!;

  const profile = await UserProfile.findOneAndUpdate(
    { authUserId, deletedAt: null },
    { $setOnInsert: { authUserId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  profile.avatar = req.body;

  const checks = [
    Boolean(profile.firstName),
    Boolean(profile.lastName),
    Boolean(profile.displayName),
    Boolean(profile.dateOfBirth),
    Boolean(profile.gender),
    Boolean(profile.avatar?.mediaId),
  ];
  const percentage = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );
  profile.set({
    completionPercentage: percentage,
    profileCompleted: percentage === 100,
  });

  const updated = await profile.save();

  return res.json(
    successResponse("Avatar updated", { avatar: updated.avatar }),
  );
};

export const removeAvatar = async (req: Request, res: Response) => {
  const authUserId = req.userId!;

  const profile = await UserProfile.findOneAndUpdate(
    { authUserId, deletedAt: null },
    { $setOnInsert: { authUserId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  profile.avatar = null;

  const checks = [
    Boolean(profile.firstName),
    Boolean(profile.lastName),
    Boolean(profile.displayName),
    Boolean(profile.dateOfBirth),
    Boolean(profile.gender),
    Boolean(profile.avatar),
    // Boolean(profile.avatar?.mediaId),
  ];
  const percentage = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );
  profile.set({
    completionPercentage: percentage,
    profileCompleted: percentage === 100,
  });

  const updated = await profile.save();

  return res.json(
    successResponse("Avatar removed", { avatar: updated.avatar }),
  );
};

export const getAddresses = async (req: Request, res: Response) => {
  const authUserId = req.userId!;

  const addresses = await Address.find({
    authUserId,
    deletedAt: null,
  }).sort({ isDefault: -1, updatedAt: -1 });

  return res.json(successResponse("Addresses fetched", { addresses }));
};

export const createAddress = async (req: Request, res: Response) => {
  const authUserId = req.userId!;

  const count = await Address.countDocuments({ authUserId, deletedAt: null });
  const shouldDefault = count === 0 || req.body.isDefault === true;

  if (shouldDefault) {
    await Address.updateMany(
      { authUserId, deletedAt: null },
      { $set: { isDefault: false } },
    );
  }

  const address = await Address.create({
    ...req.body,
    authUserId,
    isDefault: shouldDefault,
    location: req.body.coordinates
      ? { type: "Point", coordinates: req.body.coordinates }
      : undefined,
    coordinates: undefined,
  });

  return res.status(201).json(successResponse("Address created", { address }));
};

export const updateAddress = async (req: Request, res: Response) => {
  const authUserId = req.userId!;
  const addressId = String(req.params.addressId);

  if (!isValidObjectId(addressId))
    return res.status(400).json(errorResponse("Invalid address ID", 400));

  const address = await Address.findOne({
    _id: addressId,
    authUserId,
    deletedAt: null,
  });

  if (!address)
    return res.status(404).json(errorResponse("Address not found", 404));

  if (req.body.isDefault === true) {
    await Address.updateMany(
      { authUserId, deletedAt: null, _id: { $ne: address._id } },
      { $set: { isDefault: false } },
    );
  }

  if (req.body.coordinates) {
    req.body.location = {
      type: "Point",
      coordinates: req.body.coordinates,
    };
    delete req.body.coordinates;
  }

  address.set(req.body);
  const updated = await address.save();

  return res.json(successResponse("Address updated", { address: updated }));
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  const authUserId = req.userId!;
  const addressId = String(req.params.addressId);

  if (!isValidObjectId(addressId))
    return res.status(400).json(errorResponse("Invalid address ID", 400));

  const address = await Address.findOne({
    _id: addressId,
    authUserId,
    deletedAt: null,
  });

  if (!address)
    return res.status(404).json(errorResponse("Address not found", 404));

  await Address.updateMany(
    { authUserId, deletedAt: null },
    { $set: { isDefault: false } },
  );

  address.isDefault = true;
  const updated = await address.save();

  return res.json(
    successResponse("Default address updated", { address: updated }),
  );
};

export const removeAddress = async (req: Request, res: Response) => {
  const authUserId = req.userId!;
  const addressId = String(req.params.addressId);

  if (!isValidObjectId(addressId))
    return res.status(400).json(errorResponse("Invalid address ID", 400));

  const address = await Address.findOne({
    _id: addressId,
    authUserId,
    deletedAt: null,
  });

  if (!address)
    return res.status(404).json(errorResponse("Address not found", 404));

  const wasDefault = address.isDefault;
  address.deletedAt = new Date();
  address.isDefault = false;
  await address.save();

  if (wasDefault) {
    const replacement = await Address.findOne({
      authUserId,
      deletedAt: null,
    }).sort({ updatedAt: -1 });

    if (replacement)
      await Address.updateOne(
        { _id: replacement._id },
        { $set: { isDefault: true } },
      );
  }

  return res.json(successResponse("Address deleted"));
};

export const requestAccountDeletion = async (req: Request, res: Response) => {
  // Publish `user.account-deletion-requested` with userId, sessionId, reason,
  // correlationId and requestedAt. auth-service consumes it, disables the
  // account, and revokes all sessions. Other services anonymize owned data.
  return res
    .status(202)
    .json(successResponse("Account deletion request accepted"));
};
