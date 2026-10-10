import { Container } from "@/components/ui/section";

export default function Loading() {
  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-surface-2" />
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse rounded-[24px] bg-surface" />
          <div className="space-y-4">
            <div className="h-4 w-1/3 animate-pulse rounded-full bg-surface-2" />
            <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-surface-2" />
            <div className="h-8 w-1/2 animate-pulse rounded-full bg-surface-2" />
            <div className="h-24 animate-pulse rounded-[24px] bg-surface" />
          </div>
        </div>
      </Container>
    </main>
  );
}
