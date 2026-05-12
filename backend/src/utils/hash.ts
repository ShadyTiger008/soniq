import crypto from "crypto";

export function buildCacheKey(inputs: any): string {
  // Normalize before hashing so order doesn't matter
  const normalized = {
    moods: Array.isArray(inputs.moods) ? [...inputs.moods].sort() : [],
    activity: inputs.activity || "",
    energy: typeof inputs.energy === "number" ? Math.round(inputs.energy / 2) * 2 : 0, // round to nearest 2
    genres: Array.isArray(inputs.genres) ? [...inputs.genres].sort() : [],
    era: inputs.era || "",
    languages: Array.isArray(inputs.languages) ? [...inputs.languages].sort() : [],
    text: inputs.vibe?.toLowerCase().trim().slice(0, 100) || ""
  };
  
  return crypto
    .createHash("md5")
    .update(JSON.stringify(normalized))
    .digest("hex");
}
