import express from "express";
import { login, logout, signup, updateProfile,checkAuth, getProfileImage } from "../controllers/auth.controllers.js";
import { protectRoutes } from "../middlewares/auth.middleware.js";

import multer from "multer";

const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Unsupported image format"));
    }

    cb(null, true);
  },
});

const router = express.Router();

router.post("/signup",profileUpload.single("profilePic"), signup );

router.post("/login",login);

router.post("/logout",logout);

router.put("/update-profile", protectRoutes,profileUpload.single("profilePic"), updateProfile);

router.get("/profile-image/:fileId", getProfileImage);

router.get("/check", protectRoutes, checkAuth);

export default router;