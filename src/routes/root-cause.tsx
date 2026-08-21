import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/ccpd/app-shell";
import { PageHeader } from "@/components/ccpd/page-header";
import { Panel } from "@/components/ccpd/panel";
import { StatusBadge } from "@/components/ccpd/badges";
import { EmptyState, LoadingState } from "@/components/ccpd/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRootCauses } from "@/hooks/use-ccpd";

export const Route = createFileRoute("/root-cause")({
  head: () => ({
    meta: [
      { title: "Root Cause Analysis — CCPD" },
      { name: "description", content: "Explore operational issue categories, their frequency and related complaints." },
      { property: "og:title", content: "Root Cause Analysis — CCPD" },
      { property: "og:description", content: "Explore operational issue categories, their frequency and related complaints." },
    ],
  }),
  component: RootCausePage,
});

function RootCausePage() {
  const { data: records = [], isLoading } = useRootCauses();
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const grouped = Object.values(
    records.reduce<Record<string, { name: string; description: string; confidence: number; severity: string; items: typeof records }>>(
      (acc, r) => {
        const entry = acc[r.rootCause] ?? {
          name: r.rootCause,
          description: r.description,
          confidence: r.confidence,
          severity: r.severity,
          items: [],
        };
        entry.items = [...entry.items, r];
        acc[r.rootCause] = entry;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b.items.length - a.items.length);

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Root Cause Analysis" subtitle="Operational issues behind recurring complaints." />
        <LoadingState />
      </AppShell>
    );
  }

  if (!grouped.length) {
    return (
      <AppShell>
        <PageHeader title="Root Cause Analysis" subtitle="Operational issues behind recurring complaints." />
        <EmptyState
          title="No root causes yet"
          description="Root causes are generated automatically from the complaints you record."
          action={<Button asChild><Link to="/complaints">Add complaint data</Link></Button>}
        />
      </AppShell>
    );
  }

  const selected = grouped.find((g) => g.name === selectedName) ?? grouped[0]!;
  const max = grouped[0]!.items.length;
  const total = records.length;

  return (
    <AppShell>
      <PageHeader
        title="Root Cause Analysis"
        subtitle="Operational issue categories behind recurring complaint patterns."
      />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Panel title="Issue Categories" bodyClassName="p-2">
          <ul className="space-y-1">
            {grouped.map((r) => (
              <li key={r.name}>
                <button
                  onClick={() => setSelectedName(r.name)}
                  className={cn(
                    "w-full rounded-lg px-3 py-3 text-left transition-colors",
                    r.name === selected.name ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.items.length}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-border">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(r.items.length / max) * 100}%` }} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel title={selected.name} description="Category overview">
            <p className="text-sm text-muted-foreground">{selected.description}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Frequency</p>
                <p className="mt-1 text-2xl font-semibold">{selected.items.length}</p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</p>
                <p className="mt-1 text-2xl font-semibold">{selected.confidence}%</p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Severity</p>
                <p className="mt-1 text-2xl font-semibold">{selected.severity}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Related Complaints" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {selected.items.map((c) => (
                <li key={c.complaintId} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.category}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.complaintId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/complaints/$complaintId" params={{ complaintId: c.complaintId }}>View</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Top Operational Root Causes" description="Ranked share of recurring operational issues">
        <ol className="space-y-4">
          {grouped.map((r, i) => {
            const percent = Math.round((r.items.length / total) * 100);
            return (
              <li key={r.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                      {i + 1}
                    </span>
                    <span className="font-medium">{r.name}</span>
                  </span>
                  <span className="font-semibold">{percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-border">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </AppShell>
  );
}
