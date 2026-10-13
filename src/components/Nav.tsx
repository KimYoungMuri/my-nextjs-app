import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignInWithGoogleButton, SignOutButton } from "@/components/AuthButton";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_82%,white)] backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-5">
          <Link href="/" className="display text-xl font-semibold text-[var(--ink)]">
            Weekend Caps
          </Link>
          <div className="hidden items-center gap-3 text-sm text-[var(--muted)] sm:flex">
            <Link href="/" className="hover:text-[var(--ink)]">
              Feed
            </Link>
            {user ? (
              <>
                <Link href="/generate" className="hover:text-[var(--ink)]">
                  Generate
                </Link>
                <Link href="/dashboard" className="hover:text-[var(--ink)]">
                  Dashboard
                </Link>
                <Link href="/profile" className="hover:text-[var(--ink)]">
                  Profile
                </Link>
              </>
            ) : (
              <Link href="/login" className="hover:text-[var(--ink)]">
                Login
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/generate" className="btn-primary text-sm sm:hidden">
                Generate
              </Link>
              <span className="hidden max-w-40 truncate text-sm text-[var(--muted)] md:inline">
                {user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <SignInWithGoogleButton />
          )}
        </div>
      </nav>
    </header>
  );
}
