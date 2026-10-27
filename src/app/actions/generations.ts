"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runCaptionPipeline } from "@/lib/gemini";

export type ActionResult = {
  ok: boolean;
  error?: string;
  caption?: string;
};

export async function createGeneration(prompt: string): Promise<ActionResult> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { ok: false, error: "Prompt is required." };
  }

  if (trimmed.length > 280) {
    return { ok: false, error: "Keep prompts under 280 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to generate." };
  }

  const result = await runCaptionPipeline(supabase, user.id, trimmed);

  async function finishRequest(values: {
    status: "succeeded" | "failed";
    error?: string;
    generation_id?: number;
  }) {
    if (result.requestId === null) return;
    await supabase
      .from("generation_requests")
      .update({ ...values, latency_ms: Date.now() - result.startedAt })
      .eq("id", result.requestId);
  }

  if (!result.ok) {
    await finishRequest({ status: "failed", error: result.error.slice(0, 2000) });
    return { ok: false, error: result.error };
  }

  const caption = result.caption;
  const { data: generation, error } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      prompt: trimmed,
      caption,
    })
    .select("id")
    .single();

  if (error) {
    await finishRequest({ status: "failed", error: error.message });
    return { ok: false, error: error.message };
  }

  await finishRequest({ status: "succeeded", generation_id: generation.id });

  revalidatePath("/");
  revalidatePath("/generate");
  return { ok: true, caption };
}

export async function castVote(
  generationId: number,
  value: -1 | 1,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in to vote." };
  }

  const { data: existing } = await supabase
    .from("votes")
    .select("id, value")
    .eq("user_id", user.id)
    .eq("generation_id", generationId)
    .maybeSingle();

  if (existing?.value === value) {
    const { error } = await supabase.from("votes").delete().eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else if (existing) {
    const { error } = await supabase
      .from("votes")
      .update({ value })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("votes").insert({
      user_id: user.id,
      generation_id: generationId,
      value,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}
