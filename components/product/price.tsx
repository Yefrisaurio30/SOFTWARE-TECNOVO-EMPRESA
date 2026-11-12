import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/utils";

export function Price({
  value,
  before,
  className,
  beforeClassName,
  approximate = false,
}: {
  value: number;
  /** Precio anterior: se muestra tachado cuando hay oferta. */
  before?: number | null;
  className?: string;
  beforeClassName?: string;
  approximate?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      {typeof before === "number" && before > value ? (
        <del className={cn("tabular-nums line-through opacity-70", beforeClassName)}>
          {formatCOP(before)}
        </del>
      ) : null}
      <span className="tabular-nums">
        {approximate ? "Desde " : ""}
        {formatCOP(value)}
      </span>
    </span>
  );
}
