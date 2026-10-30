
import mongoose from "mongoose";

const encryptedTextSchema = new mongoose.Schema(
  {
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    salt: { type: String, required: true },
  },
  { _id: false },
);

const encryptedImageSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true },
    iv: { type: String, required: true },
    salt: { type: String, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Legacy plaintext fields.
    text: String,
    image: String,

    // Null means a legacy, unencrypted message.
    encryptionVersion: {
      type: Number,
      default: null,
    },

    encryptedPayload: {
      text: {
        type: encryptedTextSchema,
        default: undefined,
      },
      image: {
        type: encryptedImageSchema,
        default: undefined,
      },
    },
  },
  { timestamps: true },
);

messageSchema.index({
  senderId: 1,
  receiverId: 1,
  createdAt: 1,
});

messageSchema.index({
  receiverId: 1,
  senderId: 1,
  createdAt: 1,
});

messageSchema.pre("validate", function (next) {
  if (this.encryptionVersion == null) {
    return next();
  }

  if (this.encryptionVersion !== 1) {
    return next(new Error("Unsupported encryption version"));
  }

  const payload = this.encryptedPayload;

  if (this.text || this.image) {
    return next(
      new Error("Encrypted messages cannot contain plaintext"),
    );
  }

  if (!payload?.text && !payload?.image) {
    return next(new Error("Encrypted message payload is missing"));
  }

  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
