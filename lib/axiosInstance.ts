import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5100";
export const API_BASE_URL = `${BASE_URL.replace(/\/$/, "")}/api`;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const isAxiosError = axios.isAxiosError;

// 1. Attach Bearer token to all outbound requests
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = Cookies.get("token") || localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Handle 401 Unauthorized cleanly without infinite redirect loops
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (window.location.pathname !== "/login") {
        console.warn("Unauthorized API call (401). Clearing session and redirecting to /login...");
        Cookies.remove("token", { path: "/" });
        Cookies.remove("access_token", { path: "/" });
        localStorage.removeItem("token");
        sessionStorage.clear();
        try {
          await axios.post("/api/auth/logout");
        } catch {
          // ignore
        }
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

