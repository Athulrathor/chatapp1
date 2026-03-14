import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true,
        methods: ["GET", "POST"],
    },
});

// userId -> socketId
const userSocketMap = new Map();

export function getSocketId(userId) {
    return userSocketMap.get(userId);
}

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap.set(userId, socket.id);
    }

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {

        console.log("User disconnected:", socket.id);

        if (userId) {
            userSocketMap.delete(userId);
        }

        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });

});

export { io, app, server };