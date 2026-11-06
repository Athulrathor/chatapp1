import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { initializeIdentityKey } from "../libs/e2ee.js";

export const setupE2EE = async (userId) => {
  try {
    const identity = await initializeIdentityKey();

    try {
      // Fetch the current user's registered public key.
      const response = await axiosInstance.get(`/e2ee/public-key/${userId}`);

      const registeredKey = response.data;

      if (
        registeredKey.keyVersion !== identity.keyVersion ||
        registeredKey.publicKey !== identity.publicKey
      ) {
        throw new Error(
          "Local encryption identity does not match the registered server identity.",
        );
      }

      console.log("Existing E2EE identity verified");
      return true;
    } catch (error) {
      // Only register when the server confirms no key exists.
      if (error.response?.status !== 404) {
        throw error;
      }
    }

    await axiosInstance.post("/e2ee/public-key", {
      publicKey: identity.publicKey,
      keyVersion: identity.keyVersion,
    });

    console.log("New E2EE identity registered");
    return true;
  } catch (error) {
    console.error("E2EE initialization failed:", {
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });

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

      try {
        await get().initializeE2EE(res.data._id);
        get().connectSocket();
      } catch (e2eeError) {
        console.error("E2EE initialization failed:", e2eeError);
        // Keep the authenticated user.
        // Messaging should remain unavailable until E2EE is fixed.
      }
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  initializeE2EE: async (id) => {
    try {
      const userId = get().authUser?.id ?? id;
      if (!userId) {
        throw new Error("Authenticated user ID is unavailable");
      }

      await setupE2EE(userId);

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

      await get().initializeE2EE(res.data._id);
      get().connectSocket();
      toast.success("Account created successfully!!!");
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again.",
      );
      set({ authUser: null });
    } finally {
      set({ isSigningup: false });
    }
  },

  login: async (data) => {
    set({ isLoginingIn: true });

    try {
      const res = await axiosInstance.post("/auth/login", data);

      set({ authUser: res.data });

      // Restore existing identity and register public key.
      await get().initializeE2EE(res.data._id);

      get().connectSocket();

      toast.success("Logged in successfully!");
      return true;
    } catch (error) {
      console.error("Login failed:", error);

      toast.error(
        error.response?.data?.message || error.message || "Login failed",
      );
      return false;
    } finally {
      set({ isLoginingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
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
