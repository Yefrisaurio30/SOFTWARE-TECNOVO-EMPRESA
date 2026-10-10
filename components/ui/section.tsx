import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-6", className)}>{children}</div>;
}

export function Section({
  tone = "dark",
  className,
  children,
}: {
  tone?: "dark" | "light";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "py-24 md:py-32",
        tone === "dark" ? "bg-black text-text" : "bg-light text-light-text",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p
          className={cn(
            "text-sm font-medium tracking-wide uppercase",
            tone === "dark" ? "text-steel" : "text-steel-deep",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className="mt-3 font-semibold"
        style={{ fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-4 text-[17px]/relaxed", tone === "dark" ? "text-text-muted" : "text-light-muted")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
