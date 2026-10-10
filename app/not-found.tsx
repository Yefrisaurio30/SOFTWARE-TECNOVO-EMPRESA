import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1200px] flex-col items-center justify-center px-6 text-center">
      <h2 className="text-3xl font-semibold">Página no encontrada</h2>
      <Link href="/" className="mt-6 rounded-full bg-white px-6 py-3 text-black">
        Volver al inicio
      </Link>
    </main>
  );
}
