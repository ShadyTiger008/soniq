import { API_BASE_URL, API_ENDPOINTS } from "@frontend/config/api.config";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("soniq_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("soniq_token", token);
    } else {
      localStorage.removeItem("soniq_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${this.baseURL}${normalizedEndpoint}`;

    // Refresh token from localStorage if available (in case it was updated)
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("soniq_token");
      if (storedToken && storedToken !== this.token) {
        this.token = storedToken;
      }
    }

    // Build headers as a plain object
    const headersObj: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Merge existing headers if provided
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headersObj[key] = value;
        });
      } else {
        Object.assign(headersObj, options.headers);
      }
    }

    // Add authorization token
    if (this.token) {
      headersObj["Authorization"] = `Bearer ${this.token.trim()}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: headersObj,
        credentials: "include",
      });

      let data: any = {};
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        // If response is not JSON, use empty object
        data = {};
      }

      if (!response.ok) {
        return {
          success: false,
          error:
            data.message ||
            data.error ||
            `HTTP ${response.status}: ${response.statusText}`,
          message: data.message || data.error,
        };
      }

      // Backend returns { success: true, data: ... } or just { data: ... }
      return {
        success: true,
        data: data.data !== undefined ? data.data : data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Auth endpoints
  async signup(email: string, password: string, username: string) {
    return this.request(API_ENDPOINTS.AUTH.SIGNUP, {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.success && response.data) {
      // Backend returns { user, token } in data
      const loginData = response.data as any;
      if (loginData.token) {
        this.setToken(loginData.token);
      }
    }

    return response;
  }

  async logout() {
    const response = await this.request(API_ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
    });
    this.setToken(null);
    return response;
  }

  async refreshToken() {
    const response = await this.request<{ token: string }>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      {
        method: "POST",
      }
    );

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Room endpoints
  async getRooms(params?: {
    page?: number;
    limit?: number;
    mood?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.mood) queryParams.append("mood", params.mood);
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(
      `${API_ENDPOINTS.ROOM.LIST}${query ? `?${query}` : ""}`
    );
  }

  async getRoom(id: string) {
    return this.request(API_ENDPOINTS.ROOM.GET(id));
  }

  async createRoom(roomData: {
    name: string;
    description?: string;
    mood?: string;
    isPrivate?: boolean;
    maxListeners?: number;
  }) {
    return this.request(API_ENDPOINTS.ROOM.CREATE, {
      method: "POST",
      body: JSON.stringify(roomData),
    });
  }

  async updateRoom(
    id: string,
    roomData: Partial<{
      name: string;
      description: string;
      mood: string;
      isPrivate: boolean;
      maxListeners: number;
    }>
  ) {
    return this.request(API_ENDPOINTS.ROOM.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(roomData),
    });
  }

  async deleteRoom(id: string) {
    return this.request(API_ENDPOINTS.ROOM.DELETE(id), {
      method: "DELETE",
    });
  }

  async joinRoom(id: string) {
    return this.request(API_ENDPOINTS.ROOM.JOIN(id), {
      method: "POST",
    });
  }

  async leaveRoom(id: string, deleteIfHost: boolean = false) {
    return this.request(API_ENDPOINTS.ROOM.LEAVE(id, deleteIfHost), {
      method: "POST",
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request(API_ENDPOINTS.USER.ME);
  }

  async updateUser(
    userData: Partial<{
      username: string;
      email: string;
      avatar: string;
    }>
  ) {
    return this.request(API_ENDPOINTS.USER.UPDATE, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // YouTube search
  async searchYouTube(query: string, maxResults: number = 10) {
    return this.request(API_ENDPOINTS.YOUTUBE.SEARCH(query, maxResults));
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
