import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold";

export function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "High"
      ? "bg-destructive/10 text-destructive"
      : priority === "Medium"
        ? "bg-warning/15 text-warning-foreground"
        : "bg-muted text-muted-foreground";
  return <span className={cn(base, tone)}>{priority}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Resolved" || status === "Completed"
      ? "bg-success/12 text-success"
      : status === "In Progress" || status === "In Review"
        ? "bg-info/12 text-info"
        : "bg-secondary text-secondary-foreground";
  return <span className={cn(base, tone)}>{status}</span>;
}

export function TrendBadge({ trend }: { trend: string }) {
  const tone =
    trend === "Rising"
      ? "bg-destructive/10 text-destructive"
      : trend === "Falling"
        ? "bg-success/12 text-success"
        : "bg-secondary text-secondary-foreground";
  return <span className={cn(base, tone)}>{trend}</span>;
}