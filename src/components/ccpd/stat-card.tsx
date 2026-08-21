import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  positive,
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  hint?: string;
}) {
  const Icon = positive ? ArrowDownRight : ArrowUpRight;
  return (
    <div className="surface-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
              positive ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            <Icon className="h-3 w-3" />
            {delta}
          </span>
        ) : null}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}