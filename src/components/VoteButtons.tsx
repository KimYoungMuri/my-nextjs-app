"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { castVote } from "@/app/actions/generations";
import type { VoteValue } from "@/lib/types";

type VoteButtonsProps = {
  generationId: number;
  score: number;
  myVote: VoteValue | null;
  signedIn: boolean;
};

export function VoteButtons({
  generationId,
  score,
  myVote,
  signedIn,
}: VoteButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function vote(value: VoteValue) {
    if (!signedIn) {
      router.push("/login?next=/");
      return;
    }

    startTransition(async () => {
      await castVote(generationId, value);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => vote(1)}
        className={`rounded-md border px-2 py-1 text-sm disabled:opacity-50 ${
          myVote === 1
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        }`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="min-w-6 text-center text-sm tabular-nums font-medium">
        {score}
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => vote(-1)}
        className={`rounded-md border px-2 py-1 text-sm disabled:opacity-50 ${
          myVote === -1
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        }`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
