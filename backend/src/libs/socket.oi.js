<<<<<<< HEAD
=======

>>>>>>> main
import { Server } from "socket.io";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
<<<<<<< HEAD
    cors: {
        origin: [
            "http://localhost:5173", // ✅ your frontend
            process.env.CLIENT_URL,
            "https://chatapp1-chi.vercel.app"// ✅ production
        ],
        credentials: true,
        methods: ["GET", "POST"],
    },
=======
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatapp1-chi.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
>>>>>>> main
});

// userId -> socketId
const userSocketMap = new Map();

export function getSocketId(userId) {
<<<<<<< HEAD
    return userSocketMap.get(userId.toString()); // 🔥 FIX
}

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);
=======
  return userSocketMap[userId];
}

// Authenticate every Socket.IO connection using the existing JWT cookie.
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";
>>>>>>> main

    const token = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("jwt="))
      ?.slice(4);

<<<<<<< HEAD
    if (userId) {
        userSocketMap.set(userId.toString(), socket.id); // 🔥 ensure string
    }

    io.emit("getUserOnline", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {

        console.log("User disconnected:", socket.id);

        if (userId) {
            userSocketMap.delete(userId);
        }

        io.emit("getUserOnline", Array.from(userSocketMap.keys()));
    });

});

=======
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

>>>>>>> main
export { io, app, server };
