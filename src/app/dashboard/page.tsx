import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile }, { count: generationCount }, { count: voteCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, last_name")
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
    ]);

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          Members only
        </p>
        <h1 className="display text-4xl font-semibold text-[var(--ink)]">
          Your weekend stats
        </h1>
        <p className="text-[var(--muted)]">
          A quick look at how loud you’ve been on the feed.
        </p>
      </header>

      <section className="panel space-y-5 p-6">
        <div>
          <p className="text-sm text-[var(--muted)]">Signed in as</p>
          <p className="mt-1 text-xl font-semibold text-[var(--ink)]">
            {displayName}
          </p>
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,white)] p-4">
            <p className="display text-3xl text-[var(--ink)]">
              {generationCount ?? 0}
            </p>
            <p className="text-sm text-[var(--muted)]">Captions generated</p>
          </div>
          <div className="rounded-2xl bg-[color-mix(in_srgb,var(--ink)_6%,white)] p-4">
            <p className="display text-3xl text-[var(--ink)]">{voteCount ?? 0}</p>
            <p className="text-sm text-[var(--muted)]">Votes cast</p>
          </div>
        </div>
        <Link href="/generate" className="btn-primary text-sm">
          Generate another →
        </Link>
      </section>
    </main>
  );
}
