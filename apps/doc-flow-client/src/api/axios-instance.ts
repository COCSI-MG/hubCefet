import axios from "axios";
import { ErrorProcessor } from "@/lib/utils/errorProcessor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const publicAxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add error handling interceptor to public instance too
publicAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Auto error handling with opt-out capability
    const skipErrorToast =
      originalRequest.skipErrorToast ||
      originalRequest.headers?.["X-Skip-Error-Toast"] === "true";

    if (!skipErrorToast) {
      ErrorProcessor.showErrorToast(error, {
        component: "AxiosInterceptor",
        action: `${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
        timestamp: new Date(),
      });
    }

    return Promise.reject(error);
  }
);

export const privateAxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

privateAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Erro na requisição:", error);
    return Promise.reject(error);
  }
);

privateAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (authentication) errors first
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      } catch (refreshError) {
        console.error("Falha ao renovar autenticação:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    // Auto error handling with opt-out capability
    // Check if the request has opted out of automatic error handling
    const skipErrorToast =
      originalRequest.skipErrorToast ||
      originalRequest.headers?.["X-Skip-Error-Toast"] === "true";

    if (!skipErrorToast) {
      // Automatically show error toast using ErrorProcessor
      ErrorProcessor.showErrorToast(error, {
        component: "AxiosInterceptor",
        action: `${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
        timestamp: new Date(),
      });
    }

    return Promise.reject(error);
  }
);
