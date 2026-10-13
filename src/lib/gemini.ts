import { GoogleGenAI } from "@google/genai";

const MODEL_CANDIDATES = [
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

function buildPrompt(userPrompt: string) {
  return `You write chronically-online captions for Columbia students exploring New York City on weekends.

Rules:
- Return ONLY the caption text (no quotes, no preamble)
- 1-2 sentences max
- Tone: witty, slightly unhinged, Gen-Z internet voice
- Ground it in NYC dorm / subway / weekend-explore energy
- Use this user vibe/prompt: ${userPrompt}`;
}

export async function generateWeekendCaption(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const contents = buildPrompt(prompt);
  const errors: string[] = [];

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      });

      const text = response.text?.trim();
      if (!text) {
        errors.push(`${model}: empty response`);
        continue;
      }

      return text.replace(/^["']|["']$/g, "");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${model}: ${message}`);
    }
  }

  throw new Error(
    `No available Gemini model worked. Tried: ${MODEL_CANDIDATES.join(", ")}. Last errors: ${errors.slice(-2).join(" | ")}`,
  );
}
