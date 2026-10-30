
import { Server } from "socket.io";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatapp1-chi.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

export function getSocketId(userId) {
  return userSocketMap[userId];
}

// Authenticate every Socket.IO connection using the existing JWT cookie.
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";

    const token = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("jwt="))
      ?.slice(4);

    if (!token) {
      return next(new Error("Unauthorized: JWT cookie missing"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId).select("_id");

    if (!user) {
      return next(new Error("Unauthorized: User not found"));
    }

    // Never trust userId supplied through handshake.query.
    socket.data.userId = user._id.toString();

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;

  console.log("Authenticated user connected:", userId);

  userSocketMap[userId] = socket.id;

  // Send messages only to the intended recipient, not every connected user.
  socket.on("sendMessage", (message) => {
    if (!message || typeof message !== "object") return;

    const receiverId = String(message.receiverId || "");
    if (!receiverId) return;

    const receiverSocketId = userSocketMap[receiverId];

    if (!receiverSocketId) return;

    io.to(receiverSocketId).emit("newMessage", {
      ...message,
      senderId: userId,
    });
  });

  io.emit("getUserOnline", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);

    // Avoid deleting a newer connection for the same user.
    if (userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }

    io.emit("getUserOnline", Object.keys(userSocketMap));
  });
});

export { io, app, server };
