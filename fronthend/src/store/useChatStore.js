import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";


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
    const { selectedUser, message,socket } = get();

    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      set({ message: [...message, res.data] });

      socket.emit("sendMessage",res.data);
      console.log("Message send successfull");
    } catch (error) {
      toast.error(error.response.data.message);
    }
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