import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignInWithGoogleButton, SignOutButton } from "@/components/AuthButton";

function displayNameFromProfile(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | undefined,
) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || email?.split("@")[0] || "Account";
}

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let label = "Account";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

    label = displayNameFromProfile(
      profile?.first_name,
      profile?.last_name,
      user.email,
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_82%,white)] backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <Link
            href="/"
            className="display shrink-0 text-xl font-semibold text-[var(--ink)]"
          >
            Weekend Caps
          </Link>
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <Link href="/" className="hover:text-[var(--ink)]">
              Feed
            </Link>
            {user && (
              <>
                <Link href="/generate" className="hover:text-[var(--ink)]">
                  Generate
                </Link>
                <Link href="/dashboard" className="hover:text-[var(--ink)]">
                  Account
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden max-w-36 truncate text-sm font-medium text-[var(--ink)] sm:inline"
                title={label}
              >
                {label}
              </Link>
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
