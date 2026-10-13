import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignInWithGoogleButton } from "@/components/AuthButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(params.next?.startsWith("/") ? params.next : "/generate");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="panel max-w-md space-y-5 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          Weekend Caps
        </p>
        <h1 className="display text-3xl font-semibold text-[var(--ink)]">
          Sign in to drop & vote
        </h1>
        <p className="text-[var(--muted)]">
          Google login unlocks generating captions and rating the feed.
        </p>

        {params.error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--bad)]">
            Sign-in failed: {params.error}
          </p>
        )}

        <SignInWithGoogleButton />
      </div>
    </main>
  );
}
