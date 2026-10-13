import Link from "next/link";
import { VoteButtons } from "@/components/VoteButtons";
import { getFeed } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { items, error, userId } = await getFeed();
  const signedIn = Boolean(userId);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Weekend Caps
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Chronically online captions for NYC weekends
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Built for dorm-life explorers like Sam: drop a vibe, get an AI caption,
          and upvote the ones that slap. Public feed — voting and generation
          require login.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {signedIn ? (
            <Link
              href="/generate"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Generate a caption
            </Link>
          ) : (
            <Link
              href="/login?next=/generate"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Sign in to generate
            </Link>
          )}
          <Link
            href="/artists"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Artists list
          </Link>
        </div>
      </header>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Failed to load feed: {error}. Run{" "}
          <code className="font-mono text-sm">supabase/weekend-caps.sql</code>.
        </p>
      ) : items.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No captions yet. Be the first weekend drop.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-lg font-medium leading-relaxed">
                    {item.caption}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Prompt: <span className="italic">{item.prompt}</span>
                  </p>
                  <p className="text-xs text-zinc-400">
                    {item.author_name ?? "Anonymous"} ·{" "}
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <VoteButtons
                  generationId={item.id}
                  score={item.score}
                  myVote={item.my_vote}
                  signedIn={signedIn}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
