export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="rounded-full border border-white/10 px-4 py-1 text-sm text-text-muted">
        TECNOVO · F0 Setup OK
      </p>
      <h1
        className="mt-6 font-semibold tracking-tight"
        style={{ fontSize: "clamp(44px, 8vw, 104px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
      >
        Monocromo premium.
      </h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-text-muted">
        Base Next.js 15 + Tailwind + Prisma lista. En F1 montamos el sistema de
        diseño completo y el layout global.
      </p>
    </main>
  );
}
