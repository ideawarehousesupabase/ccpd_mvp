import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <Inbox className="h-5 w-5" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading your data…" }: { label?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
