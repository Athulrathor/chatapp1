import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
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
    set({ isMessageLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ message: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessages: async (messageData) => {

    const { selectedUser } = get();

    let encrypted

    if (messageData.text) {
      encrypted = encryptMessage(
        messageData.text,
        selectedUser.publicKey
      );
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

    if (!selectedUser) {
      return;
    }

    const socket = useAuthStore.getState().socket;

      if (!socket) {
        console.error("Socket is not initialized.");
        return;
      }

    socket.on("newMessage", (newMessage) => {
      const messageSendUserIsSeleceted =
        newMessage.senderId === selectedUser?._id;

      console.log("message123 : ", newMessage);
      if (!messageSendUserIsSeleceted) {
        return;
      }

      set({ message: [...get().message, newMessage] });
    });
  },

  unSubscribedToMessage: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) {
      console.error("Socket is not initialized.");
      return;
    }

    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
  },
}));