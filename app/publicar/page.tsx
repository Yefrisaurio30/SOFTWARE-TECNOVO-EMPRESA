import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getListingQuota } from "@/lib/listings";
import { purgeExpiredDrafts } from "@/lib/drafts";
import { Container, SectionHeading } from "@/components/ui/section";
import { ListingForm } from "@/components/listing/listing-form";

export const metadata = { title: "Publicar mi moto | TECNOVO" };

export default async function PublicarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=%2Fpublicar");

  // Barrido perezoso: nada de borradores zombies.
  await purgeExpiredDrafts().catch(() => 0);
  const quota = await getListingQuota(session.user.id);

  return (
    <main className="bg-white py-10 text-text md:py-14">
      <Container>
        <SectionHeading
          eyebrow=" Marketplace"
          title="Publica tu moto usada."
          description="Describe la moto, sube hasta 5 fotos y un admin revisa el anuncio antes de publicarlo."
        />
        <div className="mt-8">
          <ListingForm remaining={quota.remainingToday} />
        </div>
      </Container>
    </main>
  );
}