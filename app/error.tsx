"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1200px] flex-col items-center justify-center px-6 text-center">
      <h2 className="text-3xl font-semibold">Algo salió mal</h2>
      <p className="mt-2 text-text-muted">Inténtalo de nuevo en un momento.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-white px-6 py-3 text-black transition hover:scale-[1.02]"
      >
        Reintentar
      </button>
    </main>
  );
}
