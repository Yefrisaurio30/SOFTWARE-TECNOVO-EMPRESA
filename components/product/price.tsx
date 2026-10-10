import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/utils";

export function Price({
  value,
  className,
  approximate = false,
}: {
  value: number;
  className?: string;
  approximate?: boolean;
}) {
  return (
    <span className={cn("tabular-nums", className)}>
      {approximate ? "Desde " : ""}
      {formatCOP(value)}
    </span>
  );
}
