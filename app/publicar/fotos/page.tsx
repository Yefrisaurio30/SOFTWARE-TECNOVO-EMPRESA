import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { touchDraft } from "@/lib/drafts";
import { Container, SectionHeading } from "@/components/ui/section";
import { PhotoStep } from "@/components/listing/photo-step";

export const metadata = { title: "Fotos de tu moto | TECNOVO" };

export default async function FotosPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=%2Fpublicar");
  const { id } = await searchParams;
  if (!id) redirect("/publicar");

  const listing = await prisma.product.findFirst({
    where: { id, ownerId: session.user.id },
    select: { id: true, name: true, images: true, status: true },
  });
  if (!listing) notFound();
  // Si ya se envió, no se vuelve al paso de fotos.
  if (listing.status !== "DRAFT") redirect("/mis-anuncios");

  await touchDraft(listing.id, session.user.id);

  return (
    <main className="bg-white py-10 text-text md:py-14">
      <Container>
        <SectionHeading eyebrow="Marketplace" title="Sube las fotos." />
        <div className="mt-8">
          <PhotoStep listingId={listing.id} initialImages={listing.images} />
        </div>
      </Container>
    </main>
  );
}