import { supabase, type Book } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getBooks(): Promise<{ books: Book[]; error: string | null }> {
  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, year")
    .order("id", { ascending: true });

  if (error) {
    return { books: [], error: error.message };
  }

  return { books: data ?? [], error: null };
}

export default async function Home() {
  const { books, error } = await getBooks();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Books</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Rows loaded from Supabase
        </p>
      </header>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Failed to load books: {error}
        </p>
      ) : books.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No books found.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex items-baseline justify-between gap-4 px-4 py-3"
            >
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {book.author}
                </p>
              </div>
              {book.year != null && (
                <span className="text-sm tabular-nums text-zinc-500">
                  {book.year}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
