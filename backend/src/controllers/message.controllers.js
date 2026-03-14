import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../libs/cloudinary.js";
import { getSocketId, io } from "../libs/socket.oi.js";


export const getUserForSidebar = async (req, res) => {
    try {

        const loggedInUserId = req.user._id;

        const users = await User.find({
            _id: { $ne: loggedInUserId }
        }).select("-password");

        res.status(200).json(users);

    } catch (error) {
        console.log("Error in getUserForSidebar controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {

        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const page = Number(req.query.page) || 1;
        const limit = 30;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        res.status(200).json(messages.reverse());

    } catch (error) {
        console.log("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {

        const { encryptedText, nonce, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!encryptedText && !image) {
            return res.status(400).json({
                error: "Message content required"
            });
        }

        let imageUrl;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            encryptedText,
            nonce,
            image: imageUrl
        });

        // realtime delivery
        const receiverSocketId = getSocketId(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};