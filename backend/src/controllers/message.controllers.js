import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getSocketId, io } from "../libs/socket.oi.js";
import { getEncryptedImageStream, saveEncryptedImage } from "../libs/gridfs.js";

export const getUserForSidebar = async (req, res) => {
<<<<<<< HEAD
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
=======
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUserForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Check that the other user exists.
    const otherUser = await User.findById(userToChatId).select("_id");

    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
>>>>>>> main
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
<<<<<<< HEAD
    try {
        const {
            encryptedText,
            nonce,
            image,
        } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        console.log()
        // ✅ FIX: allow text OR image
        if (!encryptedText && !image) {
            return res.status(400).json({
                error: "Message content required"
            });
        }

        let imageUrl = null;

        // ✅ FIX: correct variable
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // ✅ Create message for all cases
        const newMessage = await Message.create({
            senderId,
            receiverId,

            text: encryptedText || null,

            senderPublicKey: req.user.publicKey,
            
            image: imageUrl || null,
            nonce: nonce || null,
        });

        // realtime delivery
        const receiverSocketId = getSocketId(receiverId);
        const senderSocketId = getSocketId(senderId);

        console.log("SENDER ID:", senderId);
        console.log("SENDER SOCKET:", senderSocketId);
        console.log("RECEIVER SOCKET:", receiverSocketId);

        // ✅ send to receiver
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        // ✅ send to sender (VERY IMPORTANT)
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage:", error.message);
        res.status(500).json({ error: "Internal server error" });
=======
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!/^[0-9a-fA-F]{24}$/.test(receiverId)) {
      return res.status(400).json({ error: "Invalid receiver ID" });
>>>>>>> main
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        error: "You cannot send a message to yourself",
      });
    }

    const receiver = await User.findById(receiverId).select("_id");

    if (!receiver) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const encryptionVersion = Number(req.body.encryptionVersion);

    if (encryptionVersion !== 1) {
      return res.status(400).json({
        error: "Unsupported encryption version",
      });
    }

    const encryptedPayload = {};

    // Optional encrypted text.
    if (req.body.textCiphertext) {
      const { textCiphertext, textIv, textSalt } = req.body;

      if (!textIv || !textSalt) {
        return res.status(400).json({
          error: "Invalid encrypted text payload",
        });
      }

      if (
        textCiphertext.length > 100_000 ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(textCiphertext) ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(textIv) ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(textSalt)
      ) {
        return res.status(400).json({
          error: "Invalid encrypted text encoding",
        });
      }

      encryptedPayload.text = {
        ciphertext: textCiphertext,
        iv: textIv,
        salt: textSalt,
      };
    }

    // Optional encrypted image.
    if (req.file) {
      const { imageIv, imageSalt, mimeType } = req.body;

      if (
        !imageIv ||
        !imageSalt ||
        !mimeType ||
        !mimeType.startsWith("image/") ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(imageIv) ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(imageSalt)
      ) {
        return res.status(400).json({
          error: "Invalid encrypted image metadata",
        });
      }

      // const uploadResult = await new Promise((resolve, reject) => {
      //   const uploadStream = cloudinary.uploader.upload_stream(
      //     {
      //       folder: "encrypted-chat-images",
      //       resource_type: "raw",
      //     },
      //     (error, result) => {
      //       if (error) return reject(error);
      //       resolve(result);
      //     },
      //   );

      //   Readable.from(req.file.buffer).pipe(uploadStream);
      // });

      const fileId = await saveEncryptedImage(req.file.buffer);

      encryptedPayload.image = {
        fileId: fileId.toString(),
        iv: imageIv,
        salt: imageSalt,
        mimeType,
      };

      // encryptedPayload.image = {
      //   url: uploadResult.secure_url,
      //   iv: imageIv,
      //   salt: imageSalt,
      //   mimeType,
      // };
    }

    if (!encryptedPayload.text && !encryptedPayload.image) {
      return res.status(400).json({
        error: "Message content is required",
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      encryptionVersion,
      encryptedPayload,
    });

    await newMessage.save();

    const messageObject = newMessage.toObject();

    const receiverSocketId = getSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messageObject);
    }

    return res.status(201).json(messageObject);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);

    return res.status(500).json({
      error: "Failed to send message",
    });
  }
};

export const getEncryptedImage = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user._id;

    // Only conversation participants can access the encrypted image.
    const message = await Message.findOne({
      $or: [
        { senderId: userId, "encryptedPayload.image.fileId": fileId },
        { receiverId: userId, "encryptedPayload.image.fileId": fileId },
      ],
    }).select("_id");

    if (!message) {
      return res.status(404).json({ error: "Image not found" });
    }

    const stream = getEncryptedImageStream(fileId);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Cache-Control", "private, no-store");

    stream.on("error", (error) => {
      console.error("GridFS download failed:", error.message);

      if (!res.headersSent) {
        res.status(404).json({ error: "Image file not found" });
      } else {
        res.destroy(error);
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Error retrieving encrypted image:", error.message);

    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to retrieve image" });
    }
  }
};
