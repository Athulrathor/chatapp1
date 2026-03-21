
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./libs/socket.oi.js";
import path from "path";
import express from "express";

dotenv.config();

const port = process.env.PORT || 10000;
const __dirname = path.resolve();

app.use(express.json());
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL
    ],
    credentials: true,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist"))); // ✅ Fixed typo: fronthend → frontend

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html")); // ✅ Fixed typo: fronthend → frontend
//   });
// }

connectDB().then(() => {
  server.listen(port, "0.0.0.0", (err) => {
    if (err) {
      console.error("Error starting server:", err);
      process.exit(1); // ✅ Exit on fatal error instead of silently continuing
    } else {
      console.log("Server is running on PORT:", port);
    }
  });
}).catch((err) => {
  console.error("Failed to connect to DB:", err);
  process.exit(1); // ✅ Exit if DB connection fails
});