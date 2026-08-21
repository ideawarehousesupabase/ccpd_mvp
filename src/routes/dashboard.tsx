import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/ccpd/app-shell";
import { PageHeader } from "@/components/ccpd/page-header";
import { Panel } from "@/components/ccpd/panel";
import { StatCard } from "@/components/ccpd/stat-card";
import { PriorityBadge, StatusBadge } from "@/components/ccpd/badges";
import { useComplaints, useDashboardMetrics, useRecommendations, useRefreshCcpd } from "@/hooks/use-ccpd";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState } from "@/components/ccpd/empty-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createComplaints } from "@/lib/ccpd-store";
import { dummyComplaints } from "@/data/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CCPD" },
      { name: "description", content: "Complaint KPIs, trends, categories and business health at a glance." },
      { property: "og:title", content: "Dashboard — CCPD" },
      { property: "og:description", content: "Complaint KPIs, trends, categories and business health at a glance." },
    ],
  }),
  component: DashboardPage,
});

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
};

function DashboardPage() {
  const { data: metrics, isLoading, userId } = useDashboardMetrics();
  const { data: complaints = [] } = useComplaints();
  const { data: recommendations = [] } = useRecommendations();
  const refresh = useRefreshCcpd();
  const [isSeeding, setIsSeeding] = useState(false);
  const hasSeeded = useRef(false);

  useEffect(() => {
    if (!userId || isSeeding || hasSeeded.current) return;
    
    const seedKey = `ccpd_seeded_${userId}`;
    if (!localStorage.getItem(seedKey)) {
      hasSeeded.current = true;
      localStorage.setItem(seedKey, "true");
      handleSeed();
    }
  }, [userId, isSeeding]);

  const handleSeed = async () => {
    if (!userId) return;
    setIsSeeding(true);
    try {
      await createComplaints(userId, dummyComplaints);
      await refresh();
      toast.success("Successfully loaded mock data!");
    } catch (err) {
      toast.error("Failed to load mock data");
    } finally {
      setIsSeeding(false);
    }
  };

  const header = (
    <PageHeader
      title="Dashboard"
      subtitle="A live view of complaint volume, operational health and the fixes in flight."
      actions={
        <Button asChild>
          <Link to="/complaints">View complaints</Link>
        </Button>
      }
    />
  );

  if (isLoading || !metrics) {
    return (
      <AppShell>
        {header}
        <LoadingState />
      </AppShell>
    );
  }

  if (metrics.totals.total === 0) {
    return (
      <AppShell>
        {header}
        <EmptyState
          title="No complaints yet"
          description="Add or upload complaint data and CCPD will automatically generate root causes, recommendations, corrective actions, packaging guidance and every metric on this dashboard."
          action={
            <Button asChild>
              <Link to="/complaints">Add complaint data</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const health = metrics.businessHealth;

  return (
    <AppShell>
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Panel
        title="Outcome Tracking"
        description="Before vs after impact of implemented corrective actions"
      >
        {metrics.outcomeTracking.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Outcome tracking appears once complaints have been recorded.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {metrics.outcomeTracking.map((o) => (
              <div key={o.id} className="rounded-xl bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{o.label}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success">
                    <ArrowDownRight className="h-3 w-3" />
                    {o.improvement}
                  </span>
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Before</p>
                    <p className="text-xl font-semibold text-muted-foreground line-through">{o.before}</p>
                  </div>
                  <TrendingDown className="mb-1.5 h-4 w-4 text-success" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">After</p>
                    <p className="text-2xl font-semibold text-success">{o.after}</p>
                  </div>
                </div>
                <Progress value={o.progress} className="mt-4 h-2" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {o.progress}% of corrective actions completed
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Complaint Trends" description="Received vs resolved, last 6 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={metrics.complaintTrend}>
              <defs>
                <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="complaints" stroke="var(--chart-1)" fill="url(#c1)" strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" stroke="var(--chart-4)" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Complaint Categories" description="Share of total volume">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={metrics.categoryBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {metrics.categoryBreakdown.map((entry, i) => (
                  <Cell key={entry.name} fill={chartColors[i % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
            {metrics.categoryBreakdown.map((c, i) => (
              <li key={c.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: chartColors[i % chartColors.length] }} />
                {c.name}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Operational Health" description="Score by function">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={metrics.operationalHealth} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="area" width={110} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="score" fill="var(--chart-2)" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Business Health Score" description="Composite operational index">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-semibold">{health.score}</span>
            <span className="text-sm text-muted-foreground">/ 100 · {health.grade}</span>
          </div>
          {metrics.improved ? (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success">
              <ArrowDownRight className="h-3 w-3 rotate-90" />
              Updated after completed corrective actions
            </p>
          ) : null}
          <div className="mt-5 space-y-4">
            {health.breakdown.map((b) => (
              <div key={b.label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-semibold">{b.value}</span>
                </div>
                <Progress value={b.value} className="h-2" />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent Activity" description="Latest workspace events">
          <ul className="space-y-4">
            {metrics.recentActivity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Recent Complaints"
          description="Newest entries in the queue"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/complaints">See all</Link>
            </Button>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border">
            {complaints.slice(0, 6).map((c) => (
              <li key={c.complaintId} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.category}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.complaintId} · {c.customer} · {c.date}
                  </p>
                </div>
                <PriorityBadge priority={c.priority} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Recommendations"
          description="Prioritised corrective actions"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/recommendations">See all</Link>
            </Button>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border">
            {recommendations.slice(0, 4).map((r) => (
              <li key={r.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{r.problem}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.recommendation}</p>
                <p className="mt-1 text-xs font-medium text-primary">{r.impact}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
