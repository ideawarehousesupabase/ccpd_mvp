import { createFileRoute } from "@tanstack/react-router";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Package } from "lucide-react";
import { AppShell } from "@/components/ccpd/app-shell";
import { PageHeader } from "@/components/ccpd/page-header";
import { Panel } from "@/components/ccpd/panel";
import { EmptyState, LoadingState } from "@/components/ccpd/empty-state";
import { usePackaging } from "@/hooks/use-ccpd";
import { packagingMetricKeys } from "@/lib/rule-engine";

export const Route = createFileRoute("/packaging")({
  head: () => ({
    meta: [
      { title: "Packaging Intelligence — CCPD" },
      { name: "description", content: "Compare packaging types on leakage resistance, heat retention, durability, cost and sustainability." },
      { property: "og:title", content: "Packaging Intelligence — CCPD" },
      { property: "og:description", content: "Compare packaging types on leakage resistance, heat retention, durability, cost and sustainability." },
    ],
  }),
  component: PackagingPage,
});

const colors = ["var(--chart-3)", "var(--chart-5)", "var(--chart-4)", "var(--chart-1)"];

function PackagingPage() {
  const { data = [], isLoading } = usePackaging();

  const byType = new Map<
    string,
    { name: string; summary: string; useCases: string[]; metrics: Record<string, number>; count: number }
  >();
  data.forEach((p) => {
    const entry = byType.get(p.packagingType);
    if (entry) entry.count += 1;
    else
      byType.set(p.packagingType, {
        name: p.packagingType,
        summary: p.summary,
        useCases: p.useCases,
        metrics: p.metrics,
        count: 1,
      });
  });
  const types = [...byType.values()].sort((a, b) => b.count - a.count);

  const radarData = packagingMetricKeys.map((metric) => {
    const row: Record<string, string | number> = { metric };
    types.forEach((p) => {
      row[p.name] = p.metrics[metric] ?? 0;
    });
    return row;
  });

  return (
    <AppShell>
      <PageHeader
        title="Packaging Intelligence"
        subtitle="How each recommended packaging type performs against the complaint drivers it influences."
      />

      {isLoading ? (
        <LoadingState label="Loading packaging analysis…" />
      ) : types.length === 0 ? (
        <EmptyState
          title="No packaging analysis yet"
          description="Packaging recommendations appear once complaints have been added and analysed."
        />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {types.map((p, idx) => (
              <article key={p.name} className="surface-card p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: colors[idx % colors.length], color: "var(--primary-foreground)" }}
                  >
                    <Package className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      recommended for {p.count} complaint{p.count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{p.summary}</p>
                <dl className="mt-5 space-y-3">
                  {packagingMetricKeys.map((m) => (
                    <div key={m}>
                      <div className="flex justify-between text-xs">
                        <dt className="text-muted-foreground">{m}</dt>
                        <dd className="font-semibold">{p.metrics[m] ?? 0}</dd>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-border">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${p.metrics[m] ?? 0}%`, background: colors[idx % colors.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recommended use cases
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {p.useCases.map((u) => (
                      <li
                        key={u}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <Panel title="Packaging Comparison" description="Recommended profiles across every metric">
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                {types.map((p, i) => (
                  <Radar
                    key={p.name}
                    name={p.name}
                    dataKey={p.name}
                    stroke={colors[i % colors.length]}
                    fill={colors[i % colors.length]}
                    fillOpacity={0.12}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
            <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {types.map((p, i) => (
                <li key={p.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                  {p.name}
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </AppShell>
  );
}
