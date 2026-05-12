import Groq from "groq-sdk";
import { geminiService, GeminiPlaylistAnalysis } from "./gemini.service.js";
import { logger } from "../utils/logger.js";

/**
 * Master AI Service that implements the Fallback Chain pattern.
 * Priority: Gemini -> Groq -> OpenRouter
 */
export class AiService {
  private groq: Groq | null = null;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
  }

  /**
   * Main entry point for AI generation with automatic failover
   */
  async generatePlaylistMetadata(prompt: string, fallbackData: any): Promise<GeminiPlaylistAnalysis> {
    const providers = [
      { name: "Gemini", call: () => geminiService.analyzeVibe(fallbackData) },
      { name: "Groq", call: () => this.callGroq(prompt) },
      { name: "OpenRouter", call: () => this.callOpenRouter(prompt) }
    ];

    for (const provider of providers) {
      try {
        logger.info(`[AI_CHAIN] Attempting generation with ${provider.name}...`);
        const result = await provider.call();
        logger.info(`✅ [AI_CHAIN] Success via ${provider.name}`);
        return result;
      } catch (error: any) {
        const errorMessage = (error.message || "").toLowerCase();
        const isRateLimit = errorMessage.includes("429") || 
                           errorMessage.includes("rate limit") || 
                           errorMessage.includes("quota") ||
                           errorMessage.includes("busy") ||
                           error.status === 429;
                           
        const isNotFound = errorMessage.includes("404") || error.status === 404;

        if (isRateLimit || isNotFound) {
          logger.warn(`⚠️ [AI_CHAIN] ${provider.name} failed (${error.message}). Falling back...`);
          continue;
        }
        
        // If it's a real error (not rate limit), rethrow it
        throw error;
      }
    }

    throw new Error("CRITICAL: All AI providers exhausted. Please try again in a few minutes.");
  }

  /**
   * Fallback 1: Groq (Llama 3.3 70B)
   */
  private async callGroq(prompt: string): Promise<GeminiPlaylistAnalysis> {
    if (!this.groq) throw new Error("Groq API key not configured");

    const chatCompletion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt + "\nRespond ONLY with valid JSON." }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("Groq returned empty response");
    
    return JSON.parse(content) as GeminiPlaylistAnalysis;
  }

  /**
   * Fallback 2: OpenRouter (Llama 3.1 8B Free)
   */
  private async callOpenRouter(prompt: string): Promise<GeminiPlaylistAnalysis> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OpenRouter API key not configured");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://soniq.ai",
        "X-Title": "Soniq AI"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "user", content: prompt + "\nRespond ONLY with valid JSON." }],
      })
    });

    if (!response.ok) {
      const errorData = await response.clone().json().catch(() => ({})) as any;
      throw new Error(`OpenRouter error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("OpenRouter returned empty response");

    // Clean markdown if present
    const cleanJson = content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson) as GeminiPlaylistAnalysis;
  }
}

export const aiService = new AiService();
