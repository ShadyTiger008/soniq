import { aiService } from "./ai.service.js";
import { youtubeService } from "./youtube.service.js";
import { PlaylistModel } from "../models/playlist.model.js";
import { logger } from "../utils/logger.js";
import { buildCacheKey } from "../utils/hash.js";
import NodeCache from "node-cache";

// Layer 1: In-memory (instant, zero DB cost)
// maxKeys: 500 playlists in RAM
const playlistCache = new NodeCache({ 
  stdTTL: 3600, 
  maxKeys: 500, 
  checkperiod: 600 
});

// Query-level cache (YouTube search results)
// maxKeys: 2000 queries in RAM
const queryCache = new NodeCache({ 
  stdTTL: 86400, 
  maxKeys: 2000, 
  checkperiod: 3600 
});

export class AIPlaylistService {
  /**
   * Generates a playlist based on user input with multi-layer caching.
   */
  async generatePlaylist(userId: string, input: any) {
    // 1. Deterministic Cache Key (Step 2)
    const cacheKey = buildCacheKey(input);
    console.log(`[PLAYLIST_SERVICE] New generation request. CacheKey: ${cacheKey}`);
    
    // 2. Check Two-Layer Cache (Step 3)
    const cachedResult = await this.getPlaylistFromCache(cacheKey);
    if (cachedResult) {
      console.log(`[PLAYLIST_SERVICE] Cache HIT found in ${cachedResult.source}`);
      logger.info(`AIPlaylistService: Cache hit (${cachedResult.source}) for key ${cacheKey}`);
      return cachedResult.data;
    }

    console.log(`[PLAYLIST_SERVICE] Cache MISS. Proceeding with fresh generation...`);

    try {
      // 3. Vibe Analysis with Fallback Chain (Gemini -> Groq -> OpenRouter)
      console.log("[PLAYLIST_SERVICE] Starting Phase 1: Multi-Provider Vibe Analysis...");
      
      // We pass both the raw input (for Gemini) and a constructed prompt (for others)
      const prompt = this.buildAIPrompt(input);
      const analysis = await aiService.generatePlaylistMetadata(prompt, input);
      
      const { playlistTitle, playlistDescription, searchQueries, mood } = analysis;
      console.log(`[PLAYLIST_SERVICE] Phase 1 Success: "${playlistTitle}" (${searchQueries?.length || 0} queries)`);

      // 4. Parallel YouTube Search with Query-Level Caching (Step 5.3)
      console.log("[PLAYLIST_SERVICE] Starting Phase 2: YouTube Search...");
      const tracks = await this.searchYouTubeWithCache(searchQueries, input.length || 10, input.experienceType);
      console.log(`[PLAYLIST_SERVICE] Phase 2 Success: Found ${tracks.length} unique tracks`);

      if (tracks.length === 0) {
        console.error("[PLAYLIST_SERVICE] Failed: No tracks found for queries");
        throw new Error("Could not find any suitable tracks for the given vibe.");
      }

      // 5. Build and Save Result (Step 5.4 & 5.5)
      const response = {
        title: playlistTitle,
        description: playlistDescription,
        mood,
        tracks,
        generatedAt: new Date(),
      };

      console.log("[PLAYLIST_SERVICE] Starting Phase 3: Persisting to Database...");
      // Persist to DB as a "permanent" record (associated with user)
      const playlist = new PlaylistModel({
        userId,
        title: playlistTitle,
        description: playlistDescription,
        mood,
        userInput: input,
        tracks,
        cacheKey, // For future cache hits
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h persistent cache
      });

      await playlist.save();
      console.log(`[PLAYLIST_SERVICE] Phase 3 Success: Playlist saved with ID: ${playlist._id}`);
      
      // Update In-Memory Cache
      playlistCache.set(cacheKey, response);

      return response;
    } catch (error) {
      console.error("[PLAYLIST_SERVICE] CRITICAL ERROR during generation:", error);
      logger.error("AIPlaylistService: Error generating playlist", error);
      throw error;
    }
  }

  /**
   * Two-layer cache retrieval: Memory -> MongoDB
   */
  private async getPlaylistFromCache(cacheKey: string) {
    // Layer 1: In-memory
    const mem = playlistCache.get(cacheKey);
    if (mem) return { data: mem, source: "memory" };

    // Layer 2: MongoDB
    const db = await PlaylistModel.findOne({ 
      cacheKey, 
      expiresAt: { $gt: new Date() } 
    }).lean();
    
    if (db) {
      const data = {
        _id: db._id,
        title: db.title,
        description: db.description,
        mood: db.mood,
        tracks: db.tracks,
        generatedAt: db.createdAt,
      };
      // Warm up memory cache
      playlistCache.set(cacheKey, data);
      return { data, source: "database" };
    }

    return null;
  }

  /**
   * Search YouTube for multiple queries with query-level caching
   */
  private async searchYouTubeWithCache(queries: string[], targetCount: number, experienceType?: string) {
    const isSingle = experienceType === "single";
    
    const searchPromises = queries.map(async (query) => {
      const key = `yt:${query.toLowerCase().trim()}`;
      
      // Check query cache
      const cached = queryCache.get(key);
      if (cached) return cached as any[];

      // Perform real search (parallel)
      const results = await youtubeService.searchMusic(query, 2);
      
      // Cache results for 24h
      queryCache.set(key, results);
      return results;
    });

    const allResults = await Promise.all(searchPromises);

    // Flatten and deduplicate
    const seenIds = new Set<string>();
    return allResults
      .flat()
      .filter((track) => {
        if (!track?.videoId || seenIds.has(track.videoId)) return false;
        
        // Quality Filter: If single song requested, filter out mixes/long videos
        if (isSingle) {
          // 1. Duration check: Most songs are < 10 mins. Mixes are usually 30m+.
          if (track.duration > 600) {
            console.log(`[PLAYLIST_SERVICE] Filtering out long video: ${track.title} (${Math.round(track.duration/60)}m)`);
            return false;
          }
          
          // 2. Title check: Avoid explicit mix/playlist keywords if single song requested
          const title = track.title.toLowerCase();
          const mixKeywords = ["mix", "playlist", "full album", "8 hours", "non stop", "compilation", "medley"];
          if (mixKeywords.some(kw => title.includes(kw))) {
             console.log(`[PLAYLIST_SERVICE] Filtering out mix-like title: ${track.title}`);
             return false;
          }
        }

        seenIds.add(track.videoId);
        return true;
      })
      .slice(0, targetCount);
  }
  /**
   * Builds the prompt for AI providers
   */
  private buildAIPrompt(input: any): string {
    const { mood, activity, energy, genres, era, language, vibe, length, experienceType } = input;
    const isSingle = experienceType === "single";
    
    return `
You are a professional music curator AI. Your task is to analyze user preferences and generate a highly curated list of search queries for YouTube to find the perfect songs.

User Input:
- Experience Type: ${experienceType || "Playlist"} ${isSingle ? "(STRICTLY ONE SINGLE SONG REQUESTED)" : ""}
- Detected Mood: ${mood || "Not specified"}
- Current Activity: ${activity || "Not specified"}
- Energy Level (1-10): ${energy || "Balanced"}
- Preferred Genres: ${genres?.join(", ") || "Mixed"}
- Preferred Era: ${era || "Modern"}
- Language: ${language || "No preference"}
- Vibe Description: "${vibe || "No additional description"}"
- Target Length: ${length || 10} songs

Respond ONLY with a valid JSON object:
{
  "playlistTitle": "A creative, catchy name for the playlist",
  "playlistDescription": "A 1-2 sentence vibe description",
  "mood": "Short detected mood string",
  "searchQueries": ["Up to ${length + 5} specific YouTube search queries. Each query should include artist names, song types, or specific vibes."],
  "suggestedEnergy": number between 1-10
}

Rules:
- Make queries specific enough to find real, high-quality music videos.
${isSingle ? "- IMPORTANT: Since a SINGLE SONG is requested, do NOT include words like 'mix', 'playlist', '8 hours', 'compilation', 'full album' in search queries. Find specific individual songs." : ""}
- If language is specified, prioritize songs in that language.

IMPORTANT: Return ONLY raw JSON. No markdown formatting.
`;
  }
}

export const aiPlaylistService = new AIPlaylistService();
