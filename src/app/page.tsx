import Link from "next/link";
import { VoteButtons } from "@/components/VoteButtons";
import { CopyButton } from "@/components/CopyButton";
import { getFeed, type FeedSort } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sort: FeedSort = params.sort === "new" ? "new" : "hot";
  const { items, error, userId } = await getFeed(sort);
  const signedIn = Boolean(userId);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
      <section className="rise space-y-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          For chronically online NYC weekends
        </p>
        <h1 className="display max-w-xl text-4xl font-semibold text-[var(--ink)] sm:text-5xl">
          Caption the city. Vote what hits.
        </h1>
        <p className="max-w-xl text-[var(--muted)]">
          Drop a vibe, get an AI caption, and rate the feed. Built so Sam (and
          you) actually come back on Friday night.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={signedIn ? "/generate" : "/login?next=/generate"}
            className="btn-primary"
          >
            {signedIn ? "Generate a caption" : "Sign in to generate"}
          </Link>
          <a href="#feed" className="btn-secondary">
            Browse the feed
          </a>
        </div>
      </section>

      <section id="feed" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="display text-2xl font-semibold text-[var(--ink)]">
              The feed
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {signedIn
                ? "Tap ▲ / ▼ to rate. Scores persist in Supabase."
                : "Anyone can browse. Sign in to vote or generate."}
            </p>
          </div>
          <div className="flex rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 text-sm">
            <Link
              href="/?sort=hot"
              className={`rounded-full px-3 py-1.5 ${
                sort === "hot"
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Hot
            </Link>
            <Link
              href="/?sort=new"
              className={`rounded-full px-3 py-1.5 ${
                sort === "new"
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              New
            </Link>
          </div>
        </div>

        {error ? (
          <p className="panel px-4 py-3 text-[var(--bad)]">
            Failed to load feed: {error}
          </p>
        ) : items.length === 0 ? (
          <div className="panel space-y-3 px-5 py-8 text-center">
            <p className="display text-xl text-[var(--ink)]">No drops yet</p>
            <p className="text-[var(--muted)]">
              Be first — generate a caption from tonight’s vibe.
            </p>
            <Link
              href={signedIn ? "/generate" : "/login?next=/generate"}
              className="btn-primary"
            >
              Start generating
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="panel rise flex gap-4 p-4 sm:p-5"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <VoteButtons
                  generationId={item.id}
                  score={item.score}
                  myVote={item.my_vote}
                  signedIn={signedIn}
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <p className="text-lg font-medium leading-snug text-[var(--ink)] sm:text-xl">
                    {item.caption}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
                    <Link
                      href={`/generate?prompt=${encodeURIComponent(item.prompt)}`}
                      className="italic hover:text-[var(--ink)] hover:underline"
                      title="Remix this prompt"
                    >
                      “{item.prompt}”
                    </Link>
                    <span aria-hidden>·</span>
                    <span>{item.author_name ?? "Anonymous"}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span aria-hidden>·</span>
                    <CopyButton text={item.caption} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
