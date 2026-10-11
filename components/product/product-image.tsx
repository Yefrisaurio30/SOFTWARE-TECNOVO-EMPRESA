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
      <div className={cn("relative overflow-hidden bg-white", className)}>
        <Image
          src={images[0]}
          alt={name}
          fill
          sizes={sizes}
          className="object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {images.length > 1 ? (
          <Image
            src={images[1]}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className="bg-white object-contain p-4 opacity-0 transition duration-300 group-hover:opacity-100"
            loading="lazy"
          />
        ) : null}
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
