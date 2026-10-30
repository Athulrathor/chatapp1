import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { initializeIdentityKey } from "../libs/e2ee.js";

export const setupE2EE = async () => {
  try {
    // Generate or load the existing browser identity.
    const identity = await initializeIdentityKey();

    // Register the public key with the backend.
    await axiosInstance.post("/e2ee/public-key", {
      publicKey: identity.publicKey,
      keyVersion: identity.keyVersion,
    });

    console.log("E2EE identity initialized successfully");

    return true;
  } catch (error) {
    console.error(
      "E2EE initialization failed:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

const base_url =
  import.meta.env.MODE === "development"
    ? "http://localhost:8080"
    : "https://chatapp-2-w6u8.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningup: false,
  isLoginingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });

      await get().initializeE2EE();
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  initializeE2EE: async () => {
    try {
      await setupE2EE();
      console.log("E2EE setup completed");
    } catch (error) {
      console.error("E2EE setup failed:", error);
      toast.error("Encryption setup failed. Messaging is unavailable.");
      throw error;
    }
  },

  signup: async (data) => {
    set({ isSigningup: true });

    try {
      const formData = new FormData();

      formData.append("fullname", data.fullname);
      formData.append("email", data.email);
      formData.append("password", data.password);

      if (data.profilePic) {
        formData.append("profilePic", data.profilePic);
      }

      const res = await axiosInstance.post("/auth/signup", formData);

      set({ authUser: res.data });
      toast.success("Account created successfully!!!");
      get().connectSocket();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again.",
      );
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
      const formData = new FormData();
      formData.append("profilePic", data.profilePic);

      const res = await axiosInstance.put("/auth/update-profile", formData);

      set({ authUser: res.data });

      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();

    if (!authUser || socket?.connected) {
      return;
    }

    const newSocket = io(base_url, {
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("getUserOnline", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
  },
}));
