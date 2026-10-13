import { createClient } from "@/lib/supabase/server";
import type { GenerationWithStats, VoteValue } from "@/lib/types";

export async function getFeed(): Promise<{
  items: GenerationWithStats[];
  error: string | null;
  userId: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: generations, error } = await supabase
    .from("generations")
    .select("id, user_id, prompt, caption, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { items: [], error: error.message, userId: user?.id ?? null };
  }

  if (!generations?.length) {
    return { items: [], error: null, userId: user?.id ?? null };
  }

  const ids = generations.map((g) => g.id);
  const authorIds = [...new Set(generations.map((g) => g.user_id))];

  const [{ data: votes }, { data: profiles }] = await Promise.all([
    supabase.from("votes").select("generation_id, user_id, value").in("generation_id", ids),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", authorIds),
  ]);

  const scoreById = new Map<number, number>();
  const myVoteById = new Map<number, VoteValue>();

  for (const vote of votes ?? []) {
    scoreById.set(
      vote.generation_id,
      (scoreById.get(vote.generation_id) ?? 0) + vote.value,
    );
    if (user && vote.user_id === user.id) {
      myVoteById.set(vote.generation_id, vote.value as VoteValue);
    }
  }

  const nameById = new Map<string, string | null>();
  for (const profile of profiles ?? []) {
    const name = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ");
    nameById.set(profile.id, name || null);
  }

  const items: GenerationWithStats[] = generations.map((generation) => ({
    ...generation,
    score: scoreById.get(generation.id) ?? 0,
    my_vote: myVoteById.get(generation.id) ?? null,
    author_name: nameById.get(generation.user_id) ?? null,
  }));

  items.sort((a, b) => b.score - a.score || b.id - a.id);

  return { items, error: null, userId: user?.id ?? null };
}
