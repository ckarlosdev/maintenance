// Production environment
export const API_BASE_URL_BASE = "https://api-gateway-px44.onrender.com/api/";

// Dev environment
export const API_BASE_URL = "http://localhost:8080/api/";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/authStore";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const apiBase = axios.create({
  baseURL: API_BASE_URL_BASE,
  timeout: 10000,
});

// ============================================================
// Tipos
// ============================================================

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ============================================================
// Refresh state
// ============================================================

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// ============================================================
// Procesar requests que estaban esperando el refresh
// ============================================================

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token!);
    }
  });

  failedQueue = [];
};

// ============================================================
// Logout
// ============================================================

const forceLogout = () => {
  const { logout } = useAuthStore.getState();

  logout();

  window.location.href = "https://ckarlosdev.github.io/login/";
};

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  // Request exitosa
  (response) => response,

  // Request fallida
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | CustomAxiosRequestConfig
      | undefined;

    // --------------------------------------------------------
    // Si no tenemos request original
    // --------------------------------------------------------

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // --------------------------------------------------------
    // Solo nos interesa HTTP 401
    // --------------------------------------------------------

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // --------------------------------------------------------
    // Si esta request ya fue reintentada, no volver a intentar
    // --------------------------------------------------------

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // --------------------------------------------------------
    // Obtener refresh token actual
    // --------------------------------------------------------

    const { refreshToken } = useAuthStore.getState();

    // --------------------------------------------------------
    // No existe refresh token
    // --------------------------------------------------------

    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    // ========================================================
    // CASO 1:
    // Ya existe un refresh en progreso
    // ========================================================

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then((newToken) => {
        originalRequest._retry = true;

        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);

        return api(originalRequest);
      });
    }

    // ========================================================
    // CASO 2:
    // Esta request será la encargada de hacer refresh
    // ========================================================

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // ------------------------------------------------------
      // IMPORTANTE:
      // Usamos axios directamente, NO api.
      //
      // Así evitamos que /refresh vuelva a pasar por este
      // interceptor.
      // ------------------------------------------------------

      const response = await axios.post(
        "https://api-gateway-px44.onrender.com/api/auth/refresh",
        {
          refreshToken,
        },
      );

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // ------------------------------------------------------
      // Guardar los nuevos tokens en Zustand
      // ------------------------------------------------------

      useAuthStore.getState().login(newToken, newRefreshToken);

      // ------------------------------------------------------
      // Liberar todas las requests que estaban esperando
      // ------------------------------------------------------

      processQueue(null, newToken);

      // ------------------------------------------------------
      // Reintentar la request que inició el refresh
      // ------------------------------------------------------

      originalRequest.headers.set("Authorization", `Bearer ${newToken}`);

      return api(originalRequest);
    } catch (refreshError) {
      // ------------------------------------------------------
      // El refresh falló
      //
      // Ejemplo:
      // - refresh token expirado
      // - refresh token inválido
      // - usuario eliminado
      // - sesión revocada
      // ------------------------------------------------------

      processQueue(refreshError as AxiosError, null);

      forceLogout();

      return Promise.reject(refreshError);
    } finally {
      // ------------------------------------------------------
      // Permitir futuros refresh cuando vuelva a expirar
      // el access token
      // ------------------------------------------------------

      isRefreshing = false;
    }
  },
);
