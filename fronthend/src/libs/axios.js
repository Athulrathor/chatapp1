import axios from "axios";

export const axiosInstance = axios.create({
<<<<<<< HEAD
    baseURL: import.meta.env.MODE === "development"
        ? "http://localhost:8080"
        : "https://chatapp-2-w6u8.onrender.com",
=======
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:8080" : `https://chatapp-2-w6u8.onrender.com`,
>>>>>>> main
    withCredentials: true,
});
