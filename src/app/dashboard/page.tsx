import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [
    { data: profile, error: profileError },
    { count: generationCount },
    { count: voteCount },
    { data: recentGenerations },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url, updated_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("generations")
      .select("id, prompt, caption, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const resolvedProfile: Profile = profile ?? {
    id: user.id,
    first_name: null,
    last_name: null,
    avatar_url: null,
  };

  const displayName =
    [resolvedProfile.first_name, resolvedProfile.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || user.email;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          Members only
        </p>
        <h1 className="display text-4xl font-semibold text-[var(--ink)]">
          Account
        </h1>
        <p className="text-[var(--muted)]">
          Your profile, stats, and recent captions in one place.
        </p>
      </header>

      <section className="panel flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        {resolvedProfile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedProfile.avatar_url}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,white)] text-lg font-semibold text-[var(--accent)]">
            {(displayName ?? "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xl font-semibold text-[var(--ink)]">{displayName}</p>
          <p className="truncate text-sm text-[var(--muted)]">{user.email}</p>
          {memberSince && (
            <p className="text-sm text-[var(--muted)]">Member since {memberSince}</p>
          )}
        </div>
        <Link href="/generate" className="btn-primary shrink-0 text-sm">
          Generate →
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="panel p-4">
          <p className="display text-3xl text-[var(--ink)]">
            {generationCount ?? 0}
          </p>
          <p className="text-sm text-[var(--muted)]">Captions generated</p>
        </div>
        <div className="panel p-4">
          <p className="display text-3xl text-[var(--ink)]">{voteCount ?? 0}</p>
          <p className="text-sm text-[var(--muted)]">Votes cast</p>
        </div>
      </section>

      {recentGenerations && recentGenerations.length > 0 && (
        <section className="space-y-3">
          <h2 className="display text-2xl font-semibold text-[var(--ink)]">
            Recent captions
          </h2>
          <ul className="space-y-3">
            {recentGenerations.map((item) => (
              <li key={item.id} className="panel space-y-1 p-4">
                <p className="font-medium text-[var(--ink)]">{item.caption}</p>
                <p className="text-sm italic text-[var(--muted)]">
                  “{item.prompt}”
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="display text-2xl font-semibold text-[var(--ink)]">
            Edit profile
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Update the name shown in the nav and on the feed. Photos go to
            Storage, not the database.
          </p>
        </div>

        {profileError && (
          <p className="panel px-4 py-3 text-[var(--bad)]">
            Failed to load profile: {profileError.message}
          </p>
        )}

        <div className="panel p-5 sm:p-6">
          <ProfileForm profile={resolvedProfile} />
        </div>
      </section>
    </main>
  );
}
