import axios from "axios";
import { ApiError } from "./errors/ApiError";
import { ErrorProcessor } from "@/lib/utils/errorProcessor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const publicAxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const privateAxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

publicAxiosInstance.interceptors.response.use(
  (res) => (res.data),
  (error) => {
    const status = error.response?.status ?? 500;

    const processedError = ErrorProcessor.processError(error);

    const message = processedError.message ?? "Erro interno no servidor, tente novamente depois";
    const data = error.response?.data;

    throw new ApiError(message, status, data);
  }
);

privateAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

privateAxiosInstance.interceptors.response.use(
  (res) => (res.data),
  (error) => {
    const status = error.response?.status ?? 500;

    if (status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return;
    }

    const processedError = ErrorProcessor.processError(error);

    const message = processedError.message ?? "Erro interno no servidor, tente novamente depois";
    const data = error.response?.data;

    throw new ApiError(message, status, data);
  }
);
