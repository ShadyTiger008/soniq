
import { logger } from "../utils/logger.js";

const UNSPLASH_API_URL = "https://api.unsplash.com";

export class UnsplashService {
  private accessKey: string;

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || "";
    if (!this.accessKey) {
      logger.warn("UNSPLASH_ACCESS_KEY is not set. Unsplash integration will not work.");
    }
  }

  async searchPhotos(query: string, page: number = 1, perPage: number = 20): Promise<UnsplashSearchResponse> {
    if (!this.accessKey) {
      return { results: [], total: 0, total_pages: 0 };
    }

    try {
      const url = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(
        query
      )}&page=${page}&per_page=${perPage}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data = (await response.json()) as UnsplashSearchResponse;
      return data;
    } catch (error) {
      logger.error("Error searching Unsplash:", error);
      throw error;
    }
  }
}

export interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
  };
}

export interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

