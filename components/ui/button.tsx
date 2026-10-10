import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primario en fondo oscuro: píldora blanca, texto negro
        primaryDark: "bg-white text-black hover:brightness-95",
        // Primario en fondo claro: píldora negra, texto blanco
        primaryLight: "bg-black text-white hover:bg-ink",
        // Secundario: enlace con flecha, sin caja
        link: "rounded-none bg-transparent px-0 text-current hover:opacity-80",
        // Fantasma oscuro: borde sutil para navbar / superficies oscuras
        ghostDark:
          "border border-white/10 bg-white/5 text-text hover:border-white/20 hover:bg-white/10",
        outlineLight: "border border-black/15 bg-transparent text-black hover:bg-black/5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[15px]",
        lg: "h-13 px-8 py-3.5 text-base",
      },
    },
    defaultVariants: { variant: "primaryDark", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
