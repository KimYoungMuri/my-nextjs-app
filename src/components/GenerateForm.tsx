"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createGeneration } from "@/app/actions/generations";

const SUGGESTIONS = [
  "lost on the L train after a midterm",
  "first bagels-and-broadway saturday",
  "dorm kitchen at 1am",
  "washington square park people-watching",
];

export function GenerateForm({ initialPrompt = "" }: { initialPrompt?: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [caption, setCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCaption(null);

    startTransition(async () => {
      const result = await createGeneration(prompt);
      if (!result.ok) {
        setError(result.error ?? "Generation failed.");
        return;
      }
      setCaption(result.caption ?? null);
      setPrompt("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="panel space-y-5 p-5 sm:p-6">
        <label className="block space-y-2 text-sm">
          <span className="font-semibold text-[var(--ink)]">What’s the vibe?</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            maxLength={280}
            placeholder="e.g. walking across campus in borrowed boots"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 outline-none ring-[var(--accent)] focus:ring-2"
            disabled={isPending}
            required
          />
          <span className="block text-right text-xs text-[var(--muted)]">
            {prompt.length}/280
          </span>
        </label>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Quick starts
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={isPending}
                onClick={() => setPrompt(suggestion)}
                className="rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-xs text-[var(--ink)] hover:border-[var(--accent)]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-[var(--bad)]">{error}</p>}

        <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60">
          {isPending ? "Generating…" : "Generate caption"}
        </button>
      </form>

      {caption && (
        <div className="panel rise space-y-3 border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            Fresh drop
          </p>
          <p className="display text-2xl leading-snug text-[var(--ink)]">{caption}</p>
          <p className="text-sm text-[var(--muted)]">
            Saved with your prompt. It’s live on the feed — go get votes.
          </p>
          <Link href="/" className="btn-secondary text-sm">
            Open the feed →
          </Link>
        </div>
      )}
    </div>
  );
}
