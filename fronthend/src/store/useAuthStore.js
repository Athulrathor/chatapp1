import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const base_url = import.meta.env.MODE === "development" ?  "http://localhost:8080" : "/";

export const useAuthStore = create((set,get) => ({
  authUser: null,
  isSigningup: false,
  isLoginingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket:null,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      get().connectSocket();
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningup: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully!!!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningup: false });
    }
  },

  login: async (data) => {
    set({ isLoginingIn: true });

    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully!!!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoginingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Loggged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully!!!");
    } catch (error) {
      console.log("Error in updateProfile UseAuthStore", error);
      toast.error(error);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) {
      console.log(
        "Socket connection skipped: authUser or socket already connected."
      );
      return;
    }

    const sockets = io(base_url, {
      query: {
        userId: authUser._id,
      },
    });
    

    set({ socket: sockets });

    sockets.on("getUserOnline", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    
    if (get().socket?.connected) {
      get().socket.disconnect();
    }

  },

}));