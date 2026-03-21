import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:8080/api" : `${import.meta.env.CLIENT_URL}/api`,
    withCredentials: true,
});