import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { errorResponse, successResponse } from "../utils/response";
import * as service from "../services/profile.service";

const userId = (req: Request) => req.userId!;

export const getProfile = async (req: Request, res: Response) => {
  const profile = await service.getOrCreateProfile(userId(req));
  return res.json(successResponse("Profile fetched", { profile }));
};

export const patchProfile = async (req: Request, res: Response) => {
  const profile = await service.updateProfile(userId(req), req.body);
  return res.json(successResponse("Profile updated", { profile }));
};

export const getCompletion = async (req: Request, res: Response) => {
  const profile = await service.getOrCreateProfile(userId(req));
  return res.json(
    successResponse("Profile completion fetched", {
      profileCompleted: profile?.profileCompleted,
      completionPercentage: profile?.completionPercentage,
    }),
  );
};

export const patchPreferences = async (req: Request, res: Response) => {
  const profile = await service.updatePreferences(userId(req), req.body);
  return res.json(
    successResponse("Preferences updated", {
      preferences: profile?.preferences,
    }),
  );
};

export const putAvatar = async (req: Request, res: Response) => {
  const profile = await service.setAvatar(userId(req), req.body);
  return res.json(
    successResponse("Avatar updated", { avatar: profile.avatar }),
  );
};

export const removeAvatar = async (req: Request, res: Response) => {
  const profile = await service.setAvatar(userId(req), null);
  return res.json(
    successResponse("Avatar removed", { avatar: profile.avatar }),
  );
};

export const getAddresses = async (req: Request, res: Response) =>
  res.json(
    successResponse("Addresses fetched", {
      addresses: await service.listAddresses(userId(req)),
    }),
  );

export const postAddress = async (req: Request, res: Response) =>
  res.status(201).json(
    successResponse("Address created", {
      address: await service.createAddress(userId(req), req.body),
    }),
  );

export const patchAddress = async (req: Request, res: Response) => {
  const addressId = String(req.params.addressId);
  if (!isValidObjectId(addressId))
    return res.status(400).json(errorResponse("Invalid address ID", 400));
  const address = await service.updateAddress(userId(req), addressId, req.body);
  if (!address)
    return res.status(404).json(errorResponse("Address not found", 404));
  return res.json(successResponse("Address updated", { address }));
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  const addressId = String(req.params.addressId);
  if (!isValidObjectId(addressId))
    return res.status(400).json(errorResponse("Invalid address ID", 400));
  const address = await service.makeDefaultAddress(userId(req), addressId);
  if (!address)
    return res.status(404).json(errorResponse("Address not found", 404));
  return res.json(successResponse("Default address updated", { address }));
};

export const removeAddress = async (req: Request, res: Response) => {
  const addressId = String(req.params.addressId);
  if (!isValidObjectId(addressId))
    return res.status(400).json(errorResponse("Invalid address ID", 400));
  const address = await service.deleteAddress(userId(req), addressId);
  if (!address)
    return res.status(404).json(errorResponse("Address not found", 404));
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
