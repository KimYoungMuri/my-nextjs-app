import { GenerateForm } from "@/components/GenerateForm";

export const dynamic = "force-dynamic";

export default function GeneratePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Gated
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Generate a weekend caption
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gemini writes the caption from your prompt. We save both the prompt
          and the caption so the feed stays remixable.
        </p>
      </header>

      <GenerateForm />
    </main>
  );
}
