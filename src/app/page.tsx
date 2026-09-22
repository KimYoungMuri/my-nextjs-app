import { supabase, type Artist } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getArtists(): Promise<{
  artists: Artist[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("artists")
    .select("id, name, genre, era, notable_work")
    .order("id", { ascending: true });

  if (error) {
    return { artists: [], error: error.message };
  }

  return { artists: data ?? [], error: null };
}

export default async function Home() {
  const { artists, error } = await getArtists();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Artists</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Rows loaded from Supabase
        </p>
      </header>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Failed to load artists: {error}
        </p>
      ) : artists.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No artists found.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {artists.map((artist) => (
            <li key={artist.id} className="space-y-1 px-4 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium">{artist.name}</p>
                {artist.era != null && (
                  <span className="text-sm text-zinc-500">{artist.era}</span>
                )}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {artist.genre}
              </p>
              {artist.notable_work != null && (
                <p className="text-sm text-zinc-500">
                  Notable: {artist.notable_work}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
