export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12:false,
    })
}

const API_URL = import.meta.env.VITE_API_URL;

export const getProfileImageUrl = (profilePic) => {
  if (!profilePic) return "/avatar.png";

  if (import.meta.env.DEV) return `http://localhost:8080/auth/profile-image/${profilePic}`;

  return `${API_URL.replace(/\/$/, "")}/auth/profile-image/${profilePic.replace(/^\//, "")}`;
};