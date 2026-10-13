"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateWeekendCaption } from "@/lib/gemini";

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

  let caption: string;
  try {
    caption = await generateWeekendCaption(trimmed);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI generation failed.";
    return { ok: false, error: message };
  }

  const { error } = await supabase.from("generations").insert({
    user_id: user.id,
    prompt: trimmed,
    caption,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

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
