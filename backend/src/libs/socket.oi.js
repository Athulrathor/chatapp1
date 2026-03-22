import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173", // ✅ your frontend
            process.env.CLIENT_URL,  // ✅ production
        ],
        credentials: true,
        methods: ["GET", "POST"],
    },
});

// userId -> socketId
const userSocketMap = new Map();

export function getSocketId(userId) {
    return userSocketMap.get(userId.toString()); // 🔥 FIX
}

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    const userId = socket.handshake.query.userId;

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

export { io, app, server };