
import express from "express";
import { protectRoutes } from "../middlewares/auth.middleware.js";

import {
  registerPublicKey,
  getPublicKey,
} from "../controllers/e2ee.controllers.js";

const router = express.Router();

router.use(protectRoutes);

router.post("/public-key", registerPublicKey);
router.get("/public-key/:id", getPublicKey);

export default router;
