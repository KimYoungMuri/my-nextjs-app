"use client";

import { createClient } from "@/lib/supabase/client";

export function SignInWithGoogleButton() {
  async function handleSignIn() {
    const supabase = createClient();
    const origin = window.location.origin;

    // Assignment requires redirect URI exactly /auth/callback (no extra query params).
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      Sign in with Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Sign out
      </button>
    </form>
  );
}
