import { logger } from "../utils/logger.js";

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  thumbnail?: string;
}

export class YouTubeService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
  }

  async search(query: string, maxResults: number = 10): Promise<YouTubeSearchResult[]> {
    if (!this.apiKey) {
      // Fallback: Use a simple search method (requires API key for production)
      logger.warn("YouTube API key not configured, using fallback search");
      return this.fallbackSearch(query, maxResults);
    }

    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.apiKey}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      
      if (!data.items || data.items.length === 0) {
        return [];
      }

      // Get video details for duration
      const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${this.apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = (await detailsResponse.json()) as any;

      return data.items.map((item: any, index: number) => {
        const details = detailsData.items[index];
        const duration = this.parseDuration(details?.contentDetails?.duration || "PT0S");
        
        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          duration,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        };
      });
    } catch (error) {
      logger.error("Error searching YouTube:", error);
      return this.fallbackSearch(query, maxResults);
    }
  }

  async searchMusic(query: string, maxResults: number = 2): Promise<YouTubeSearchResult[]> {
    if (!this.apiKey) {
      logger.warn("YouTube API key not configured, using fallback search");
      return this.fallbackSearch(query, maxResults);
    }

    console.log(`[YOUTUBE] Searching music for query: "${query}"`);
    try {
      // Use videoCategoryId=10 for Music
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.apiKey}`;
      
      const response = await fetch(searchUrl);
      console.log(`[YOUTUBE] Search API Status: ${response.status} for query: "${query}"`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[YOUTUBE] API Error: ${errorText}`);
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      console.log(`[YOUTUBE] Found ${data.items?.length || 0} initial items for "${query}"`);
      
      if (!data.items || data.items.length === 0) {
        return [];
      }

      // Get video details for duration
      const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${this.apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = (await detailsResponse.json()) as any;
      console.log(`[YOUTUBE] Details API Status: ${detailsResponse.status} for ${data.items.length} videos`);

      const results = data.items.map((item: any) => {
        const details = detailsData.items.find((d: any) => d.id === item.id.videoId);
        const duration = this.parseDuration(details?.contentDetails?.duration || "PT0S");
        
        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          duration,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        };
      });

      console.log(`[YOUTUBE] Returning ${results.length} processed results for "${query}"`);
      return results;
    } catch (error) {
      console.error(`[YOUTUBE] Exception while searching for "${query}":`, error);
      logger.error(`Error searching YouTube for "${query}":`, error);
      return [];
    }
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration (e.g., PT4M13S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    const seconds = parseInt(match[3] || "0", 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  private async fallbackSearch(query: string, _maxResults: number): Promise<YouTubeSearchResult[]> {
    // Fallback: Return empty or use a public search method
    // In production, this should use YouTube Data API v3 with an API key
    logger.warn(`Fallback search for: ${query} (API key not configured)`);
    
    // For now, return empty array - user needs to configure YouTube API key
    // Alternatively, you could use a third-party service or scrape (not recommended)
    return [];
  }
}

export const youtubeService = new YouTubeService();

