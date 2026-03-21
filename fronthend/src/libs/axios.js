import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:8080/api" : `https://chatapp-2-w6u8.onrender.com/api`,
    withCredentials: true,
});