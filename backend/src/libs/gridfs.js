import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";

const getBucket = (bucketName = "chatImages") => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not ready");
  }

  return new GridFSBucket(db, { bucketName });
};

export const saveEncryptedImage = async (buffer) => {
  const bucket = getBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(
      `encrypted-${Date.now()}.bin`,
      {
        contentType: "application/octet-stream",
      },
    );

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id));

    uploadStream.end(buffer);
  });
};

export const getEncryptedImageStream = (fileId) => {
  if (!ObjectId.isValid(fileId)) {
    throw new Error("Invalid image ID");
  }

  return getBucket().openDownloadStream(new ObjectId(fileId));
};

export const saveProfileImage = async (buffer, mimeType) => {
  const bucket = getBucket("profileImages");

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(
      `profile-${Date.now()}`,
      { contentType: mimeType },
    );

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));

    uploadStream.end(buffer);
  });
};

export const getProfileImageStream = async (fileId) => {
    const profileImagesBucket = getBucket("profileImages");

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new Error("Invalid profile image ID");
  }

  const objectId = new mongoose.Types.ObjectId(fileId);

  const files = await profileImagesBucket
    .find({ _id: objectId })
    .toArray();

  if (!files.length) {
    throw new Error("Profile image not found");
  }

  const file = files[0];

  const stream = profileImagesBucket.openDownloadStream(objectId);

  return {
    stream,
    contentType: file.metadata?.mimeType || file.contentType || "application/octet-stream",
  };
};