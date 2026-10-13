import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  const resolvedProfile: Profile = profile ?? {
    id: user.id,
    first_name: null,
    last_name: null,
    avatar_url: null,
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Update your name and upload a photo. Images are stored in Supabase
          Storage, not in the database.
        </p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Failed to load profile: {error.message}
        </p>
      )}

      <ProfileForm profile={resolvedProfile} />
    </main>
  );
}
