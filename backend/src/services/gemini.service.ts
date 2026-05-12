import { logger } from "../utils/logger.js";
import { geminiQueue } from "../utils/requestQueue.js";

export interface GeminiPlaylistAnalysis {
  playlistTitle: string;
  playlistDescription: string;
  mood: string;
  searchQueries: string[];
  suggestedEnergy: number;
}

export class GeminiService {
  private models: string[] = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

  async analyzeVibe(input: any, attempt = 0): Promise<GeminiPlaylistAnalysis> {
    return geminiQueue.add(() => this.callGeminiDirect(input, attempt));
  }

  private async callGeminiDirect(input: any, attempt = 0): Promise<GeminiPlaylistAnalysis> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in .env");
    }

    const model = this.models[Math.min(attempt, this.models.length - 1)];
    const prompt = this.buildPrompt(input);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      console.log(`[GEMINI] Sending request to model: ${model} (Attempt ${attempt + 1})`);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      });

      // If Rate Limited (429) or Model Not Found (404)
      if ((response.status === 429 || response.status === 404) && attempt < this.models.length - 1) {
        let delay = 2000; // Default 2s for 404/generic 429
        
        if (response.status === 429) {
          // Extract retry delay from Google's response if available (usually in seconds)
          const errorData = await response.clone().json().catch(() => ({})) as any;
          const googleRetryDelay = errorData?.error?.details?.find((d: any) => d.retryDelay)?.retryDelay;
          
          if (googleRetryDelay) {
            // Convert "38s" string to milliseconds
            delay = (parseInt(googleRetryDelay) || 30) * 1000 + 1000;
          } else {
            delay = Math.pow(2, attempt) * 5000; // Aggressive backoff (5s, 10s, 20s...)
          }
          
          logger.warn(`Gemini 429 on ${model}. Google says wait ${delay/1000}s. Throttling...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          logger.warn(`Gemini 404 on ${model}. Switching to next model...`);
        }
        
        return this.analyzeVibe(input, attempt + 1);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[GEMINI] API Failure Details:", JSON.stringify(errorData));
        throw new Error(`Gemini API error (${response.status}): ${response.statusText}`);
      }

      const data = await response.json() as any;
      const rawText = data.candidates[0].content.parts[0].text;
      
      // Strip markdown code blocks if present
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      
      console.log(`[GEMINI] Success from ${model}.`);
      return JSON.parse(cleanJson) as GeminiPlaylistAnalysis;

    } catch (error: any) {
      console.error(`[GEMINI] Error on ${model}:`, error.message);
      
      // Ensure we rethrow the error with enough context for the controller
      if (error.message.includes("429") || error.message.includes("rate limit")) {
        throw new Error(`GEMINI_RATE_LIMIT: Gemini service is busy after ${attempt + 1} attempts.`);
      }
      
      throw error;
    }
  }

  private buildPrompt(input: any): string {
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
- Target Length: ${length || 1} songs

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
- Ensure diversity in queries so the playlist isn't repetitive.
- The number of queries should be slightly more than the target length to allow for deduplication.
`;
  }
}

export const geminiService = new GeminiService();
