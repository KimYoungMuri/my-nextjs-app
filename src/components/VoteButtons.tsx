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
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-[color-mix(in_srgb,var(--background)_70%,white)] px-2 py-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => vote(1)}
        className={`grid h-8 w-8 place-items-center rounded-full text-sm transition disabled:opacity-50 ${
          myVote === 1
            ? "bg-[var(--accent)] text-white"
            : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
        }`}
        aria-label={signedIn ? "Upvote" : "Sign in to upvote"}
        title={signedIn ? "Upvote" : "Sign in to vote"}
      >
        ▲
      </button>
      <span className="min-w-6 text-center text-sm tabular-nums font-semibold text-[var(--ink)]">
        {score}
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => vote(-1)}
        className={`grid h-8 w-8 place-items-center rounded-full text-sm transition disabled:opacity-50 ${
          myVote === -1
            ? "bg-[var(--ink)] text-white"
            : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
        }`}
        aria-label={signedIn ? "Downvote" : "Sign in to downvote"}
        title={signedIn ? "Downvote" : "Sign in to vote"}
      >
        ▼
      </button>
    </div>
  );
}
