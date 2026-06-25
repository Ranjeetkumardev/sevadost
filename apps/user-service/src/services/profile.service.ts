import { UserProfile } from "../models/UserProfile.model";

export const getProfile = async (
  identityId: string
) => {
  const profile =
    await UserProfile.findOne({
      identityId,
    });

  if (!profile) {
    return {
      success: true,
      statusCode: 200,
      message: "Profile not found",
      data: {
        profileCompleted: false,
      },
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Profile fetched successfully",
    data: profile,
  };
};

export const createProfile = async (
  identityId: string
) => {
  const existing =
    await UserProfile.findOne({
      identityId,
    });

  if (existing) {
    return {
      success: true,
      statusCode: 200,
      message: "Profile already exists",
      data: existing,
    };
  }

  const profile =
    await UserProfile.create({
      identityId,
    });

  return {
    success: true,
    statusCode: 201,
    message: "Profile created successfully",
    data: profile,
  };
};

export const updateProfile = async (
  identityId: string,
  payload: any
) => {
  const profile =
    await UserProfile.findOneAndUpdate(
      { identityId },
      { $set: payload },
      {
        new: true,
      }
    );

  if (!profile) {
    return {
      success: false,
      statusCode: 404,
      message: "Profile not found",
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Profile updated successfully",
    data: profile,
  };
};