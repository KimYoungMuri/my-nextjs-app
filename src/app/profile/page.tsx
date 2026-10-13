import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  const resolvedProfile: Profile = profile ?? {
    id: user.id,
    first_name: null,
    last_name: null,
    avatar_url: null,
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          Members only
        </p>
        <h1 className="display text-4xl font-semibold text-[var(--ink)]">
          Profile
        </h1>
        <p className="text-[var(--muted)]">
          Name + photo for the feed. Images live in Storage, not the database.
        </p>
      </header>

      {error && (
        <p className="panel px-4 py-3 text-[var(--bad)]">
          Failed to load profile: {error.message}
        </p>
      )}

      <div className="panel p-5 sm:p-6">
        <ProfileForm profile={resolvedProfile} />
      </div>
    </main>
  );
}
