import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
<<<<<<< HEAD
import nacl from "tweetnacl";
import * as util from "tweetnacl-util";

const encryptMessage = (message, receiverPublicKey) => {

  const senderPrivateKey = localStorage.getItem("privateKey");

  const nonce = nacl.randomBytes(24);

  const encrypted = nacl.box(
    util.decodeUTF8(message),
    nonce,
    util.decodeBase64(receiverPublicKey),
    util.decodeBase64(senderPrivateKey)
  );

  return {
    encryptedText: util.encodeBase64(encrypted),
    nonce: util.encodeBase64(nonce),
  };
};

const encryptImage = (base64Image, receiverPublicKey) => {
  try {
    const privateKeyBase64 = localStorage.getItem("privateKey");

    if (!privateKeyBase64) return null;

    const senderPrivateKey = util.decodeBase64(privateKeyBase64);

    const nonce = nacl.randomBytes(24);

    const encrypted = nacl.box(
      util.decodeUTF8(base64Image),
      nonce,
      util.decodeBase64(receiverPublicKey),
      senderPrivateKey
    );

    return {
      encryptedImage: util.encodeBase64(encrypted),
      nonce: util.encodeBase64(nonce),
    };

  } catch (error) {
    console.error("Image encryption error:", error);
    return null;
  }
};
=======
import {
  decryptImage,
  decryptMessage,
  encryptImage,
  encryptMessage,
} from "../libs/e2ee";

const getPeerPublicKey = async (userId) => {
  const res = await axiosInstance.get(`/e2ee/public-key/${userId}`);

  if (res.data.keyVersion !== 1 || !res.data.publicKey) {
    throw new Error("Recipient encryption key is unavailable");
  }

  return res.data.publicKey;
};

const decryptStoredMessage = async ({
  message,
  peerPublicKey,
  currentUserId,
}) => {
  if (message.encryptionVersion == null) {
    return message;
  }

  const result = { ...message, text: "" };

  // Support nested and older flat text payloads.
  const textPayload =
    message.encryptedPayload?.text ??
    (message.encryptedPayload?.ciphertext ? message.encryptedPayload : null);

  // Decrypt text.
  if (textPayload) {
    try {
      result.text = await decryptMessage({
        message: {
          ...message,
          encryptedPayload: textPayload,
        },
        peerPublicKey,
        currentUserId,
      });
    } catch (error) {
      console.error("Text decryption failed:", error);
      result.text = "[Unable to decrypt this message]";
    }
  }

  // Decrypt image.
  const encryptedImage = message.encryptedPayload?.image;

  if (encryptedImage?.fileId) {
    try {
      const response = await axiosInstance.get(
        `/message/image/${encryptedImage.fileId}`,
        { responseType: "blob" },
      );

      const decryptedBlob = await decryptImage({
        message: {
          ...message,
          encryptedPayload: encryptedImage,
        },
        encryptedBlob: response.data,
        peerPublicKey,
        currentUserId,
      });

      result.decryptedImage = URL.createObjectURL(decryptedBlob);
    } catch (error) {
      console.error("Image decryption failed:", error);
      result.imageError = true;
    }
  }

  return result;
};

let activeMessageHandler = null;
>>>>>>> main

export const useChatStore = create((set, get) => ({
  message: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessageLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });

    try {
      const res = await axiosInstance.get("message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessageLoading: true, message: [] });

    try {
      const [res, peerPublicKey] = await Promise.all([
        axiosInstance.get(`/message/${userId}`),
        getPeerPublicKey(userId),
      ]);

      const currentUserId = useAuthStore.getState().authUser?._id;

      if (!currentUserId) {
        throw new Error("User authentication is unavailable");
      }

      const decryptedMessages = await Promise.all(
        res.data.map(async (message) => {
          try {
            return await decryptStoredMessage({
              message,
              peerPublicKey,
              currentUserId,
            });
          } catch (error) {
            console.error("Message processing failed:", error);

            return {
              ...message,
              text: "[Unable to decrypt this message]",
            };
          }
        }),
      );

      if (String(get().selectedUser?._id) === String(userId)) {
        set({ message: decryptedMessages });
      }
    } catch (error) {
      console.error("Error loading messages:", error);

      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to load messages",
      );
    } finally {
      if (String(get().selectedUser?._id) === String(userId)) {
        set({ isMessageLoading: false });
      }
    }
  },

  sendMessages: async (messageData) => {
<<<<<<< HEAD

    const { selectedUser } = get();

    let encrypted

    if (messageData.text) {
      encrypted = encryptMessage(
        messageData.text,
        selectedUser.publicKey
      );
=======
    const { selectedUser } = get();
    const currentUser = useAuthStore.getState().authUser;

    try {
      if (!selectedUser || !currentUser?._id) {
        throw new Error("Select a conversation first");
      }

      const text = messageData.text?.trim();
      const image = messageData.image;

      if (!text && !image) {
        throw new Error("Message cannot be empty");
      }

      const receiverId = selectedUser._id;
      const receiverPublicKey = await getPeerPublicKey(receiverId);

      const formData = new FormData();
      formData.append("encryptionVersion", "1");

      // Encrypt text.
      if (text) {
        const encryptedText = await encryptMessage({
          text,
          senderId: currentUser._id,
          receiverId,
          receiverPublicKey,
        });

        formData.append(
          "textCiphertext",
          encryptedText.encryptedPayload.ciphertext,
        );
        formData.append("textIv", encryptedText.encryptedPayload.iv);
        formData.append("textSalt", encryptedText.encryptedPayload.salt);
      }

      // Encrypt image.
      if (image) {
        const encryptedImage = await encryptImage({
          file: image,
          senderId: currentUser._id,
          receiverId,
          receiverPublicKey,
        });

        formData.append(
          "image",
          encryptedImage.encryptedBlob,
          "encrypted-image.bin",
        );
        formData.append("imageIv", encryptedImage.encryptedPayload.iv);
        formData.append("imageSalt", encryptedImage.encryptedPayload.salt);
        formData.append("mimeType", encryptedImage.encryptedPayload.mimeType);
      }

      const res = await axiosInstance.post(
        `/message/send/${receiverId}`,
        formData,
      );

      const localMessage = {
        ...res.data,
        text: text || "",
        localImage: image ? URL.createObjectURL(image) : null,
      };

      if (String(get().selectedUser?._id) === String(receiverId)) {
        set((state) => ({
          message: [...state.message, localMessage],
        }));
      }

      return res.data;
    } catch (error) {
      console.error("Message sending failed:", error);

      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to send message",
      );

      throw error;
>>>>>>> main
    }

    if (messageData.image) {
      encrypted = encryptImage(
        messageData.image,
        selectedUser.publicKey
      );
    }

    await axiosInstance.post(
      `/message/send/${selectedUser._id}`,
      encrypted
    );
  },

  subscribedToMessage: () => {
    const { selectedUser } = get();
    const currentUser = useAuthStore.getState().authUser;
    const socket = useAuthStore.getState().socket;

    if (!selectedUser?._id || !currentUser?._id || !socket) {
      console.error("Chat or socket is not initialized.");
      return;
    }

    // Remove only our previous handler.
    if (activeMessageHandler) {
      socket.off("newMessage", activeMessageHandler);
    }

    const conversationUserId = String(selectedUser._id);
    const currentUserId = String(currentUser._id);

    const handler = async (newMessage) => {
      const isCurrentConversation =
        String(newMessage.senderId) === conversationUserId &&
        String(newMessage.receiverId) === currentUserId;

      if (!isCurrentConversation) return;

      try {
        if (newMessage.encryptionVersion !== 1) {
          throw new Error("Unsupported message encryption version");
        }

        const peerPublicKey = await getPeerPublicKey(conversationUserId);

        const decryptedMessage = await decryptStoredMessage({
          message: newMessage,
          peerPublicKey,
          currentUserId,
        });

        // Ignore messages if the user switched conversations.
        if (String(get().selectedUser?._id) !== conversationUserId) {
          if (decryptedMessage.decryptedImage) {
            URL.revokeObjectURL(decryptedMessage.decryptedImage);
          }
          return;
        }

        set((state) => {
          if (state.message.some((item) => item._id === newMessage._id)) {
            if (decryptedMessage.decryptedImage) {
              URL.revokeObjectURL(decryptedMessage.decryptedImage);
            }
            return state;
          }

          return {
            message: [...state.message, decryptedMessage],
          };
        });
      } catch (error) {
        console.log(error);
      }
    };

    activeMessageHandler = handler;
    socket.on("newMessage", handler);
  },

  unSubscribedToMessage: () => {
    const socket = useAuthStore.getState().socket;

    if (socket && activeMessageHandler) {
      socket.off("newMessage", activeMessageHandler);
    }

    activeMessageHandler = null;
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
  },
}));
