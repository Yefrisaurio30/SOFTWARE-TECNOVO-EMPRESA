import Image from "next/image";
import { Bike, Cog, Package } from "lucide-react";
import type { ProductType } from "@prisma/client";
import { cn } from "@/lib/utils";

const ICONS: Record<ProductType, typeof Bike> = {
  MOTO_NUEVA: Bike,
  MOTO_USADA: Bike,
  REPUESTO: Cog,
  ACCESORIO: Package,
};

export function ProductImage({
  images,
  name,
  type,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: {
  images: string[];
  name: string;
  type: ProductType;
  className?: string;
  sizes?: string;
}) {
  if (images.length > 0) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={images[0]}
          alt={name}
          fill
          sizes={sizes}
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
    );
  }
  const Icon = ICONS[type];
  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden",
        "bg-[radial-gradient(ellipse_at_center,#2A2A2D_0%,#161618_70%)]",
        className,
      )}
      role="img"
      aria-label={`Imagen ilustrativa de ${name}`}
    >
      <div
        className="absolute rounded-full border border-white/10"
        style={{ width: "70%", aspectRatio: "1", opacity: 0.6 }}
        aria-hidden
      />
      <Icon size={64} strokeWidth={1} className="relative text-steel" aria-hidden />
    </div>
  );
}
