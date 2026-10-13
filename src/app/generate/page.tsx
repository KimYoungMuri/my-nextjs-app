import { GenerateForm } from "@/components/GenerateForm";

export const dynamic = "force-dynamic";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const params = await searchParams;
  const initialPrompt = params.prompt?.slice(0, 280) ?? "";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          Members only
        </p>
        <h1 className="display text-4xl font-semibold text-[var(--ink)]">
          Generate a weekend caption
        </h1>
        <p className="max-w-xl text-[var(--muted)]">
          Gemini writes the line. We store the prompt and caption so the feed
          stays remixable.
        </p>
      </header>

      <GenerateForm initialPrompt={initialPrompt} />
    </main>
  );
}
