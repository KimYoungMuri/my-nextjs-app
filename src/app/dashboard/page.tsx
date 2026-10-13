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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Gated route
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Your Weekend Caps activity — only visible when logged in.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">Signed in as</p>
        <p className="mt-1 text-lg font-medium">{displayName}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {user.email}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <p className="text-2xl font-semibold">{generationCount ?? 0}</p>
            <p className="text-sm text-zinc-500">Captions generated</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <p className="text-2xl font-semibold">{voteCount ?? 0}</p>
            <p className="text-sm text-zinc-500">Votes cast</p>
          </div>
        </div>
        <Link
          href="/generate"
          className="mt-4 inline-block text-sm font-medium underline"
        >
          Generate another caption →
        </Link>
      </section>
    </main>
  );
}
