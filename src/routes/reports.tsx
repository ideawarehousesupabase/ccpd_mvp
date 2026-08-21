import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/ccpd/app-shell";
import { PageHeader } from "@/components/ccpd/page-header";
import { Panel } from "@/components/ccpd/panel";
import { EmptyState, LoadingState } from "@/components/ccpd/empty-state";
import { Button } from "@/components/ui/button";
import { useReportSnapshot } from "@/hooks/use-ccpd";
import { downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — CCPD" },
      { name: "description", content: "Complaint trends, refund impact, operational performance and branch comparison reports." },
      { property: "og:title", content: "Reports — CCPD" },
      { property: "og:description", content: "Complaint trends, refund impact, operational performance and branch comparison reports." },
    ],
  }),
  component: ReportsPage,
});

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
};

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

function ReportsPage() {
  const { data: report, isLoading } = useReportSnapshot();

  const exportSummary = () => {
    if (!report) return;
    downloadCsv(
      "ccpd-operational-summary.csv",
      ["Metric", "Value"],
      report.operationalSummary.map((s) => [s.label, s.value]),
    );
    toast.success("Operational summary exported.");
  };

  const header = (
    <PageHeader
      title="Reports"
      subtitle="Operational reporting generated from your complaint records."
      actions={
        <Button onClick={exportSummary} disabled={!report}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      }
    />
  );

  if (isLoading || !report) {
    return (
      <AppShell>
        {header}
        <LoadingState label="Building your reports…" />
      </AppShell>
    );
  }

  if (report.categoryBreakdown.length === 0) {
    return (
      <AppShell>
        {header}
        <EmptyState
          title="No report data yet"
          description="Add complaints on the Complaints page and your reports will be generated automatically."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      {header}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Complaint Trend" description="Monthly complaint volume">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={report.complaintTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" {...axis} />
              <YAxis {...axis} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="complaints" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="resolved" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top Complaint Categories" description="Share of total volume">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={report.categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" {...axis} interval={0} angle={-18} textAnchor="end" height={60} />
              <YAxis {...axis} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Refund Impact" description="Estimated monthly refund exposure in USD">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={report.refundImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" {...axis} />
              <YAxis {...axis} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="refunds" fill="var(--chart-5)" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Operational Performance" description="On-time delivery vs order accuracy (%)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={report.operationalPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" {...axis} />
              <YAxis domain={[60, 100]} {...axis} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="onTime" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="accuracy" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Branch Comparison" description="Complaints received vs resolved by location">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={report.branchComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="branch" {...axis} />
            <YAxis {...axis} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="complaints" fill="var(--chart-1)" radius={[6, 6, 0, 0]} barSize={22} />
            <Bar dataKey="resolved" fill="var(--chart-4)" radius={[6, 6, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Operational Summary" description="Headline indicators from your complaint records">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {report.operationalSummary.map((s) => (
            <div key={s.label} className="rounded-xl bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
