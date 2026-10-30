
import express from "express";
import multer from "multer";

import { protectRoutes } from "../middlewares/auth.middleware.js";

import {
    getEncryptedImage,
  getMessages,
  getUserForSidebar,
  sendMessage,
} from "../controllers/message.controllers.js";

const router = express.Router();

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024,
  },
});

router.use(protectRoutes);

router.get("/users", getUserForSidebar);
router.get("/:id", getMessages);

router.post("/send/:id", upload.single("image"), sendMessage);

router.get("/image/:fileId", getEncryptedImage);

export default router;
