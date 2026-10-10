import { Container } from "@/components/ui/section";
import { CatalogSkeleton } from "@/components/catalog/skeletons";

export default function Loading() {
  return (
    <main className="bg-black py-10 text-text md:py-14">
      <Container>
        <div className="h-10 w-2/3 animate-pulse rounded-full bg-surface-2" />
        <div className="mt-3 h-5 w-1/2 animate-pulse rounded-full bg-surface-2" />
        <div className="mt-8 h-44 animate-pulse rounded-[28px] bg-surface" />
        <div className="mt-8">
          <CatalogSkeleton />
        </div>
      </Container>
    </main>
  );
}
