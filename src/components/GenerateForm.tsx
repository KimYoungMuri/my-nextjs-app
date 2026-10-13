"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGeneration } from "@/app/actions/generations";

const SUGGESTIONS = [
  "lost on the L train after a midterm",
  "first bagels-and-broadway saturday",
  "dorm kitchen at 1am",
  "washington square park people-watching",
];

export function GenerateForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">What’s the vibe?</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            maxLength={280}
            placeholder="e.g. walking across campus in borrowed boots"
            className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            disabled={isPending}
            required
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isPending}
              onClick={() => setPrompt(suggestion)}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isPending ? "Generating…" : "Generate caption"}
        </button>
      </form>

      {caption && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Fresh drop</p>
          <p className="mt-2 text-lg font-medium leading-relaxed">{caption}</p>
          <p className="mt-3 text-sm text-zinc-500">
            Posted to the public feed — go upvote yours.
          </p>
        </div>
      )}
    </div>
  );
}
