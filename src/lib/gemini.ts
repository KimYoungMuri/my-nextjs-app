import { GoogleGenAI } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";

type ModelConfig = {
  id: number | null;
  modelId: string;
  temperature: number;
  maxOutputTokens: number;
};

type StepConfig = {
  id: number | null;
  name: string;
  instruction: string;
  modelId: number | null;
};

type ChainConfig = {
  id: number | null;
  steps: StepConfig[];
};

const MAX_EXAMPLES = 4;
const MAX_TERMS = 20;

const FALLBACK_MODELS: ModelConfig[] = [
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
].map((modelId) => ({ id: null, modelId, temperature: 0.95, maxOutputTokens: 512 }));

const FALLBACK_CHAIN: ChainConfig = {
  id: null,
  steps: [
    {
      id: null,
      name: "Built-in one-shot",
      modelId: null,
      instruction: `You write chronically-online captions for Columbia students exploring New York City on weekends.

Rules:
- Return ONLY the caption text (no quotes, no preamble)
- 1-2 sentences max
- Tone: witty, slightly unhinged, Gen-Z internet voice
- Ground it in NYC dorm / subway / weekend-explore energy
- Use this user vibe/prompt: {{prompt}}`,
    },
  ],
};

function pickWeighted<T extends { weight: number }>(items: T[]): T | null {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll < 0) return item;
  }
  return items.at(-1) ?? null;
}

function shuffle<T>(items: T[]) {
  return items
    .map((item) => ({ item, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}

/** Load chain mix, steps, terms, examples, and models from the admin-managed tables. Falls back to built-ins if any are missing. */
async function loadConfig(supabase: SupabaseClient) {
  const [mix, terms, examples, models] = await Promise.all([
    supabase
      .from("prompt_chain_mix")
      .select("chain_id, weight")
      .eq("is_enabled", true)
      .gt("weight", 0),
    supabase.from("terms").select("term, definition").eq("is_active", true).limit(MAX_TERMS),
    supabase.from("generation_examples").select("prompt, caption").eq("is_active", true),
    supabase
      .from("llm_models")
      .select("id, model_id, temperature, max_output_tokens, llm_providers!inner(slug, is_active)")
      .eq("is_active", true)
      .eq("llm_providers.is_active", true)
      .eq("llm_providers.slug", "google")
      .order("priority"),
  ]);

  const modelList: ModelConfig[] =
    !models.error && models.data.length > 0
      ? models.data.map((m) => ({
          id: m.id,
          modelId: m.model_id,
          temperature: Number(m.temperature),
          maxOutputTokens: m.max_output_tokens,
        }))
      : FALLBACK_MODELS;

  let chain = FALLBACK_CHAIN;
  const picked = mix.error ? null : pickWeighted(mix.data ?? []);
  if (picked) {
    const { data: steps } = await supabase
      .from("prompt_chain_steps")
      .select("id, name, instruction, model_id")
      .eq("chain_id", picked.chain_id)
      .order("step_order");
    if (steps && steps.length > 0) {
      chain = {
        id: picked.chain_id,
        steps: steps.map((s) => ({
          id: s.id,
          name: s.name,
          instruction: s.instruction,
          modelId: s.model_id,
        })),
      };
    }
  }

  const termText =
    (terms.data ?? []).map((t) => `- ${t.term}: ${t.definition}`).join("\n") || "(none)";
  const exampleText =
    shuffle(examples.data ?? [])
      .slice(0, MAX_EXAMPLES)
      .map((e) => `- Vibe: ${e.prompt}\n  Caption: ${e.caption}`)
      .join("\n") || "(none)";

  return { chain, models: modelList, termText, exampleText };
}

function render(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => vars[key] ?? match);
}

function cleanCaption(text: string) {
  return text
    .trim()
    .replace(/^(final caption|caption)\s*:\s*/i, "")
    .replace(/^["'“]|["'”]$/g, "")
    .trim();
}

export type PipelineResult =
  | { ok: true; caption: string; requestId: number | null; startedAt: number }
  | { ok: false; error: string; requestId: number | null; startedAt: number };

/**
 * Run one caption generation through the admin-configured prompt chain,
 * logging a generation_requests row and one llm_responses row per model call.
 */
export async function runCaptionPipeline(
  supabase: SupabaseClient,
  userId: string,
  prompt: string,
): Promise<PipelineResult> {
  const startedAt = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Missing GEMINI_API_KEY", requestId: null, startedAt };
  }

  const { chain, models, termText, exampleText } = await loadConfig(supabase);

  const { data: request } = await supabase
    .from("generation_requests")
    .insert({ user_id: userId, prompt, chain_id: chain.id })
    .select("id")
    .single();
  const requestId: number | null = request?.id ?? null;

  const ai = new GoogleGenAI({ apiKey });
  let previous = "";

  for (const step of chain.steps) {
    const input = render(step.instruction, {
      prompt,
      terms: termText,
      examples: exampleText,
      previous,
    });

    const ordered = step.modelId
      ? [...models.filter((m) => m.id === step.modelId), ...models.filter((m) => m.id !== step.modelId)]
      : models;

    let output: string | null = null;
    const errors: string[] = [];

    for (const model of ordered) {
      const callStart = Date.now();
      let text: string | null = null;
      let failure: string | null = null;
      try {
        const response = await ai.models.generateContent({
          model: model.modelId,
          contents: input,
          config: { temperature: model.temperature, maxOutputTokens: model.maxOutputTokens },
        });
        text = response.text?.trim() || null;
        if (!text) failure = "Empty response";
      } catch (error) {
        failure = error instanceof Error ? error.message : String(error);
      }

      if (requestId !== null) {
        await supabase.from("llm_responses").insert({
          request_id: requestId,
          step_id: step.id,
          model_id: model.id,
          model_name: model.modelId,
          input_text: input,
          output_text: text,
          status: failure ? "failed" : "succeeded",
          error: failure?.slice(0, 2000) ?? null,
          latency_ms: Date.now() - callStart,
        });
      }

      if (text && !failure) {
        output = text;
        break;
      }
      errors.push(`${model.modelId}: ${failure}`);
    }

    if (output === null) {
      return {
        ok: false,
        error: `Step "${step.name}" failed on every model. ${errors.slice(-2).join(" | ")}`,
        requestId,
        startedAt,
      };
    }
    previous = output;
  }

  const caption = cleanCaption(previous);
  if (!caption) {
    return { ok: false, error: "The model returned an empty caption.", requestId, startedAt };
  }
  return { ok: true, caption, requestId, startedAt };
}
