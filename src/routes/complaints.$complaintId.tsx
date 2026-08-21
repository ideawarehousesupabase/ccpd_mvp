import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Tags,
  Search,
  Lightbulb,
  Clock,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/ccpd/app-shell";
import { PageHeader } from "@/components/ccpd/page-header";
import { Panel } from "@/components/ccpd/panel";
import { PriorityBadge, StatusBadge } from "@/components/ccpd/badges";
import { LoadingState } from "@/components/ccpd/empty-state";
import { Button } from "@/components/ui/button";
import { useComplaintBundle } from "@/hooks/use-ccpd";

export const Route = createFileRoute("/complaints/$complaintId")({
  head: () => ({
    meta: [
      { title: "Complaint details — CCPD" },
      { name: "description", content: "Full complaint breakdown with category, department, root cause and corrective action." },
      { property: "og:title", content: "Complaint details — CCPD" },
      { property: "og:description", content: "Full complaint breakdown with category, department, root cause and corrective action." },
    ],
  }),
  component: ComplaintDetail,
});

function ComplaintDetail() {
  const { complaintId } = useParams({ from: "/complaints/$complaintId" });
  const { data, isLoading } = useComplaintBundle(complaintId);

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title={complaintId} subtitle="Loading complaint record" />
        <LoadingState />
      </AppShell>
    );
  }

  const complaint = data?.complaint;
  if (!complaint) {
    return (
      <AppShell>
        <PageHeader title="Complaint not found" subtitle={`No record exists for ${complaintId}.`} />
        <Button asChild variant="outline">
          <Link to="/complaints"><ArrowLeft className="mr-2 h-4 w-4" /> Back to complaints</Link>
        </Button>
      </AppShell>
    );
  }

  const { rootCause, recommendation, action, packaging } = data!;
  const facts = [
    ["Complaint Category", complaint.category],
    ["Department", complaint.department],
    ["Branch / Location", complaint.branch || "—"],
    ["Product / Service", complaint.product || "—"],
    ["Source", complaint.source],
    ["Date", complaint.date],
  ] as const;

  const isResolved = complaint.status === "Resolved";
  const inProgress = action?.status === "In Progress";
  const lifecycle = [
    { label: "Complaint Received", icon: Inbox, state: "done" as const },
    { label: "Complaint Categorized", icon: Tags, state: "done" as const },
    { label: "Root Cause Identified", icon: Search, state: "done" as const },
    { label: "Recommendation Generated", icon: Lightbulb, state: "done" as const },
    isResolved
      ? { label: "Corrective Action Completed", icon: CheckCircle2, state: "done" as const }
      : {
          label: inProgress ? "Corrective Action In Progress" : "Awaiting Corrective Action",
          icon: Clock,
          state: "current" as const,
        },
  ];

  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/complaints"><ArrowLeft className="mr-2 h-4 w-4" /> Back to complaints</Link>
      </Button>

      <PageHeader
        title={complaint.complaintId}
        subtitle={`Reported by ${complaint.customer}`}
        actions={
          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Complaint Text">
            <p className="text-sm leading-relaxed text-foreground">“{complaint.text}”</p>
          </Panel>

          {rootCause ? (
            <Panel title="Root Cause" description={`Confidence ${rootCause.confidence}% · Severity ${rootCause.severity}`}>
              <div className="flex gap-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div>
                  <p className="font-medium">{rootCause.rootCause}</p>
                  <p className="mt-1 text-muted-foreground">{rootCause.description}</p>
                </div>
              </div>
            </Panel>
          ) : null}

          {recommendation ? (
            <Panel title="Recommendation" description={`Estimated timeline · ${recommendation.timeline}`}>
              <div className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div>
                  <p className="font-medium">{recommendation.recommendation}</p>
                  <p className="mt-1 text-primary">{recommendation.impact}</p>
                </div>
              </div>
              <ol className="mt-4 space-y-2">
                {recommendation.steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </Panel>
          ) : null}

          <Panel title="Complaint Lifecycle" description="Journey of this complaint through CCPD">
            <ol className="space-y-0">
              {lifecycle.map((step, i) => {
                const Icon = step.icon;
                const done = step.state === "done";
                return (
                  <li key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full",
                          done ? "bg-success/12 text-success" : "bg-warning/15 text-warning-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {i < lifecycle.length - 1 ? <span className="my-1 w-px flex-1 bg-border" /> : null}
                    </div>
                    <div className={cn("pb-6", i === lifecycle.length - 1 && "pb-0")}>
                      <p className="text-sm font-medium">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{done ? "Completed" : "In progress"}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Classification" className="h-fit">
            <dl className="space-y-4">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</dt>
                <dd className="mt-1"><PriorityBadge priority={complaint.priority} /></dd>
              </div>
            </dl>
          </Panel>

          {packaging ? (
            <Panel title="Packaging Guidance" className="h-fit">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Package className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold">{packaging.packagingType}</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{packaging.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {packaging.useCases.map((u) => (
                  <li key={u} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {u}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
