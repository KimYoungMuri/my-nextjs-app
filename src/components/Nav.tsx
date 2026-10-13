import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignInWithGoogleButton, SignOutButton } from "@/components/AuthButton";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-medium hover:underline">
            Artists
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/profile" className="hover:underline">
                Profile
              </Link>
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-zinc-500 sm:inline">
                {user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <SignInWithGoogleButton />
          )}
        </div>
      </div>
    </nav>
  );
}
