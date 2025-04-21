import express from "express";
import { protectRoutes } from "../middlewares/auth.middleware.js";
import {getMessages,getUserForSidebar,sendMessage} from "../controllers/message.controllers.js";

const router = express.Router();


router.get("/users", protectRoutes, getUserForSidebar);
router.get("/:id", protectRoutes, getMessages);

router.post('/send/:id', protectRoutes, sendMessage);

export default router;