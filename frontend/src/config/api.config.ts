/**
 * API Configuration
 *
 * This file centralizes all API URLs and endpoints.
 * Change BASE_URL to switch between development and production environments.
 */

// Base URL configuration
// For local development: http://localhost:5001
// For production: https://soniq-88py.onrender.com
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  (process.env.NODE_ENV === "production"
    ? "https://soniq-88py.onrender.com"
    : "http://localhost:5001");

// API Base URL (includes /api prefix)
export const API_BASE_URL = `${BASE_URL}/api`;

// Socket.IO URL (same as BASE_URL, no /api prefix)
export const SOCKET_URL = BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh",
  },

  // User endpoints
  USER: {
    ME: "/users/me",
    UPDATE: "/users/me",
    MY_ROOMS: "/users/me/rooms",
    HISTORY: "/users/me/history",
  },

  // Room endpoints
  ROOM: {
    LIST: "/rooms",
    GET: (id: string) => `/rooms/${id}`,
    CREATE: "/rooms",
    UPDATE: (id: string) => `/rooms/${id}`,
    DELETE: (id: string) => `/rooms/${id}`,
    JOIN: (id: string) => `/rooms/${id}/join`,
    LEAVE: (id: string, deleteIfHost: boolean = false) =>
      `/rooms/${id}/leave${deleteIfHost ? "?delete=true" : ""}`,
  },

  // YouTube endpoints
  YOUTUBE: {
    SEARCH: (query: string, maxResults: number = 10) =>
      `/youtube/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
  },

  // Unsplash requests
  UNSPLASH: {
    SEARCH: (query: string, page: number = 1, perPage: number = 20) =>
      `/unsplash/search?query=${encodeURIComponent(query)}&page=${page}&perPage=${perPage}`,
  },
} as const;

// Export BASE_URL for reference
export { BASE_URL };
