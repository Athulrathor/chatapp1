import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({path:"./src/.env"})

const mongoose_uri = process.env.MONGODB_URI;

export const connectDB = async () => {
    try {
        const connected = await mongoose.connect(mongoose_uri);
        console.log("MongoDB connected:",connected.connection.host)
    } catch (error) {
        console.log("MongoDB connection error:",error)
    }
}