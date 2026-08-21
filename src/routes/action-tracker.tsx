import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/ccpd/app-shell";
import { PageHeader } from "@/components/ccpd/page-header";
import { Panel } from "@/components/ccpd/panel";
import { StatusBadge } from "@/components/ccpd/badges";
import { StatCard } from "@/components/ccpd/stat-card";
import { EmptyState, LoadingState } from "@/components/ccpd/empty-state";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActions, useRefreshCcpd, useUserId } from "@/hooks/use-ccpd";
import { updateActionStatus } from "@/lib/ccpd-store";
import type { WorkStatus } from "@/lib/ccpd-types";

export const Route = createFileRoute("/action-tracker")({
  head: () => ({
    meta: [
      { title: "Action Tracker — CCPD" },
      { name: "description", content: "Track corrective actions, owners, implementation dates and expected impact." },
      { property: "og:title", content: "Action Tracker — CCPD" },
      { property: "og:description", content: "Track corrective actions, owners, implementation dates and expected impact." },
    ],
  }),
  component: ActionTrackerPage,
});

const statuses: WorkStatus[] = ["Pending", "In Progress", "Completed"];

function ActionTrackerPage() {
  const { data: items = [], isLoading } = useActions();
  const { userId } = useUserId();
  const refresh = useRefreshCcpd();
  const [pending, setPending] = useState<string | null>(null);

  const update = async (complaintId: string, status: WorkStatus) => {
    if (!userId) return;
    setPending(complaintId);
    try {
      await updateActionStatus(userId, complaintId, status);
      await refresh();
      toast.success(
        status === "Completed"
          ? `${complaintId} completed — dashboard metrics updated.`
          : `${complaintId} marked as ${status}.`,
      );
    } catch {
      toast.error("Could not update the action. Please try again.");
    } finally {
      setPending(null);
    }
  };

  const count = (s: WorkStatus) => items.filter((i) => i.status === s).length;

  return (
    <AppShell>
      <PageHeader
        title="Action Tracker"
        subtitle="Track the rollout of corrective actions across departments. Completing an action updates the dashboard outcome metrics."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={String(count("Pending"))} hint="awaiting kick-off" />
        <StatCard label="In Progress" value={String(count("In Progress"))} hint="being implemented" />
        <StatCard label="Completed" value={String(count("Completed"))} positive hint="verified fixes" />
      </div>

      {isLoading ? (
        <LoadingState label="Loading corrective actions…" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No corrective actions yet"
          description="Actions are created automatically for every complaint you add on the Complaints page."
        />
      ) : (
        <Panel bodyClassName="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Expected Impact</TableHead>
                  <TableHead className="text-right">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.action}</TableCell>
                    <TableCell className="whitespace-nowrap">{i.department}</TableCell>
                    <TableCell><StatusBadge status={i.status} /></TableCell>
                    <TableCell className="w-32">
                      <Progress value={i.progress} className="h-1.5" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {i.implementationDate ?? i.expectedCompletion}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{i.impact}</TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={i.status}
                        disabled={pending === i.complaintId}
                        onValueChange={(v) => void update(i.complaintId, v as WorkStatus)}
                      >
                        <SelectTrigger className="ml-auto w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>
      )}
    </AppShell>
  );
}
