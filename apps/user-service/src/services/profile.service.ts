import { Address } from "../models/Address.model";
import { UserProfile } from "../models/UserProfile.model";

const calculateCompletion = (profile: any) => {
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
  return {
    completionPercentage: percentage,
    profileCompleted: percentage === 100,
  };
};

export const getOrCreateProfile = (authUserId: string) =>
  UserProfile.findOneAndUpdate(
    { authUserId, deletedAt: null },
    { $setOnInsert: { authUserId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

export const updateProfile = async (
  authUserId: string,
  input: Record<string, unknown>,
) => {
  const profile = await getOrCreateProfile(authUserId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  profile.set(input);
  profile.set(calculateCompletion(profile));
  return profile.save();
};

export const updatePreferences = async (
  authUserId: string,
  input: Record<string, unknown>,
) =>
  UserProfile.findOneAndUpdate(
    { authUserId, deletedAt: null },
    {
      $set: Object.fromEntries(
        Object.entries(input).map(([key, value]) => [
          `preferences.${key}`,
          value,
        ]),
      ),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

export const setAvatar = async (
  authUserId: string,
  avatar: { mediaId: string; url: string } | null,
) => {
  const profile = await getOrCreateProfile(authUserId);
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  profile.avatar = avatar;
  profile.set(calculateCompletion(profile));
  return profile.save();
};

export const listAddresses = (authUserId: string) =>
  Address.find({ authUserId, deletedAt: null }).sort({
    isDefault: -1,
    updatedAt: -1,
  });

export const createAddress = async (authUserId: string, input: any) => {
  const count = await Address.countDocuments({ authUserId, deletedAt: null });
  const shouldDefault = count === 0 || input.isDefault === true;
  if (shouldDefault) {
    await Address.updateMany(
      { authUserId, deletedAt: null },
      { $set: { isDefault: false } },
    );
  }
  return Address.create({
    ...input,
    authUserId,
    isDefault: shouldDefault,
    location: input.coordinates
      ? { type: "Point", coordinates: input.coordinates }
      : undefined,
    coordinates: undefined,
  });
};

export const updateAddress = async (
  authUserId: string,
  addressId: string,
  input: any,
) => {
  const address = await Address.findOne({
    _id: addressId,
    authUserId,
    deletedAt: null,
  });
  if (!address) return null;
  if (input.isDefault === true) {
    await Address.updateMany(
      { authUserId, deletedAt: null, _id: { $ne: address._id } },
      { $set: { isDefault: false } },
    );
  }
  if (input.coordinates) {
    input.location = { type: "Point", coordinates: input.coordinates };
    delete input.coordinates;
  }
  address.set(input);
  return address.save();
};

export const makeDefaultAddress = async (
  authUserId: string,
  addressId: string,
) => {
  const address = await Address.findOne({
    _id: addressId,
    authUserId,
    deletedAt: null,
  });
  if (!address) return null;
  await Address.updateMany(
    { authUserId, deletedAt: null },
    { $set: { isDefault: false } },
  );
  address.isDefault = true;
  return address.save();
};

export const deleteAddress = async (authUserId: string, addressId: string) => {
  const address = await Address.findOne({
    _id: addressId,
    authUserId,
    deletedAt: null,
  });
  if (!address) return null;
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
  return address;
};

// import { UserProfile } from "../models/UserProfile.model";

// export const getProfile = async (
//   identityId: string
// ) => {
//   const profile =
//     await UserProfile.findOne({
//       identityId,
//     });

//   if (!profile) {
//     return {
//       success: true,
//       statusCode: 200,
//       message: "Profile not found",
//       data: {
//         profileCompleted: false,
//       },
//     };
//   }

//   return {
//     success: true,
//     statusCode: 200,
//     message: "Profile fetched successfully",
//     data: profile,
//   };
// };

// export const createProfile = async (
//   identityId: string
// ) => {
//   const existing =
//     await UserProfile.findOne({
//       identityId,
//     });

//   if (existing) {
//     return {
//       success: true,
//       statusCode: 200,
//       message: "Profile already exists",
//       data: existing,
//     };
//   }

//   const profile =
//     await UserProfile.create({
//       identityId,
//     });

//   return {
//     success: true,
//     statusCode: 201,
//     message: "Profile created successfully",
//     data: profile,
//   };
// };

// export const updateProfile = async (
//   identityId: string,
//   payload: any
// ) => {
//   const profile =
//     await UserProfile.findOneAndUpdate(
//       { identityId },
//       { $set: payload },
//       {
//         new: true,
//       }
//     );

//   if (!profile) {
//     return {
//       success: false,
//       statusCode: 404,
//       message: "Profile not found",
//     };
//   }

//   return {
//     success: true,
//     statusCode: 200,
//     message: "Profile updated successfully",
//     data: profile,
//   };
// };
