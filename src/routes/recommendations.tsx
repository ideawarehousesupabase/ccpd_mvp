import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { AppShell } from "@/components/ccpd/app-shell";
import { PageHeader } from "@/components/ccpd/page-header";
import { PriorityBadge, StatusBadge } from "@/components/ccpd/badges";
import { EmptyState, LoadingState } from "@/components/ccpd/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRecommendations } from "@/hooks/use-ccpd";
import type { KeyedRecommendation } from "@/lib/ccpd-types";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — CCPD" },
      { name: "description", content: "Prioritised corrective recommendations with expected operational impact." },
      { property: "og:title", content: "Recommendations — CCPD" },
      { property: "og:description", content: "Prioritised corrective recommendations with expected operational impact." },
    ],
  }),
  component: RecommendationsPage,
});

const filters = ["All", "Pending", "In Progress", "Completed"];
const priorityRank: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

function RecommendationsPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<KeyedRecommendation | null>(null);
  const { data = [], isLoading } = useRecommendations();

  const list = data
    .filter((r) => filter === "All" || r.status === filter)
    .sort((a, b) => (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3));

  return (
    <AppShell>
      <PageHeader
        title="Recommendations"
        subtitle="Each recurring complaint pattern is paired with a corrective recommendation."
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f}
            variant={f === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState label="Loading recommendations…" />
      ) : list.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          description="Recommendations are generated automatically as soon as you add complaints on the Complaints page."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <article
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(r)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(r);
                }
              }}
              className={cn(
                "surface-card flex cursor-pointer flex-col p-5 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Lightbulb className="h-4 w-4" />
                </span>
                <PriorityBadge priority={r.priority} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Problem</p>
              <h3 className="text-lg font-semibold">{r.problem}</h3>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommendation</p>
              <p className="text-sm">{r.recommendation}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expected impact</p>
              <p className="text-sm text-primary">{r.impact}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">{r.department}</span>
                <StatusBadge status={r.status} />
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.problem}</DialogTitle>
                <DialogDescription>{selected.recommendation}</DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={selected.priority} />
                  <StatusBadge status={selected.status} />
                  <span className="text-xs text-muted-foreground">{selected.department}</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Expected impact
                    </p>
                    <p className="mt-1 text-sm text-primary">{selected.impact}</p>
                  </div>
                  <div className="rounded-xl bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Estimated timeline
                    </p>
                    <p className="mt-1 text-sm">{selected.timeline}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Linked complaint
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {[selected.category, selected.complaintId].map((c) => (
                      <li
                        key={c}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Suggested implementation steps
                  </p>
                  <ol className="mt-2 space-y-2">
                    {selected.steps.map((s, i) => (
                      <li key={s} className="flex gap-3 text-sm">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Business impact
                  </p>
                  <p className="mt-1 text-sm">{selected.businessImpact}</p>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
