import { GoogleGenAI } from "@google/genai";

export async function generateWeekendCaption(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `You write chronically-online captions for Columbia students exploring New York City on weekends.

Rules:
- Return ONLY the caption text (no quotes, no preamble)
- 1-2 sentences max
- Tone: witty, slightly unhinged, Gen-Z internet voice
- Ground it in NYC dorm / subway / weekend-explore energy
- Use this user vibe/prompt: ${prompt}`,
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty caption");
  }

  return text.replace(/^["']|["']$/g, "");
}
