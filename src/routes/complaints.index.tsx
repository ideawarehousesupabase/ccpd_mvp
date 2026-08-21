import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Upload, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/ccpd/app-shell";
import { PageHeader } from "@/components/ccpd/page-header";
import { Panel } from "@/components/ccpd/panel";
import { PriorityBadge, StatusBadge } from "@/components/ccpd/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComplaintUploadDialog } from "@/components/ccpd/complaint-upload-dialog";
import {
  ManualComplaintDialog,
  type ManualComplaintValues,
} from "@/components/ccpd/manual-complaint-dialog";
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
import { useComplaints, useRefreshCcpd, useUserId } from "@/hooks/use-ccpd";
import { createComplaints } from "@/lib/ccpd-store";
import { parseComplaintCsv } from "@/lib/csv";
import type { ComplaintStatus, Priority } from "@/lib/ccpd-types";

export const Route = createFileRoute("/complaints/")({
  head: () => ({
    meta: [
      { title: "Complaints — CCPD" },
      { name: "description", content: "Browse, filter and triage every customer complaint in one table." },
      { property: "og:title", content: "Complaints — CCPD" },
      { property: "og:description", content: "Browse, filter and triage every customer complaint in one table." },
    ],
  }),
  component: ComplaintsPage,
});

const channels = ["Manual Entry", "CSV Upload"];

function ComplaintsPage() {
  const { data: rows = [], isLoading } = useComplaints();
  const { userId } = useUserId();
  const refresh = useRefreshCcpd();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [channel, setChannel] = useState("All");
  const [manualOpen, setManualOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const q = search.trim().toLowerCase();
        const match =
          !q ||
          r.complaintId.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q);
        return (
          match &&
          (status === "All" || r.status === status) &&
          (priority === "All" || r.priority === priority) &&
          (channel === "All" || r.source === channel)
        );
      }),
    [rows, search, status, priority, channel],
  );

  const handleUpload = async (file: File) => {
    if (!userId) return;
    setBusy(true);
    try {
      const { rows: parsed, errors } = parseComplaintCsv(await file.text());
      if (!parsed.length) {
        toast.error(errors[0] ?? "No valid rows found in this file.");
        return;
      }
      await createComplaints(userId, parsed);
      await refresh();
      setUploadOpen(false);
      toast.success(`${parsed.length} complaints imported and analysed.`);
      if (errors.length) toast.warning(`${errors.length} row(s) skipped.`);
    } catch {
      toast.error("Could not process this file.");
    } finally {
      setBusy(false);
    }
  };

  const addManual = async (values: ManualComplaintValues) => {
    if (!userId) return;
    setBusy(true);
    try {
      await createComplaints(userId, [
        {
          customer: values.customer,
          text: values.text,
          category: values.category,
          branch: values.branch,
          product: values.product,
          date: values.date,
          priority: values.priority as Priority,
          status: values.status as ComplaintStatus,
          source: "Manual Entry",
        },
      ]);
      await refresh();
      setManualOpen(false);
      toast.success("Complaint stored — analysis generated automatically.");
    } catch {
      toast.error("Could not save this complaint.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Complaints"
        subtitle={`${rows.length} complaint${rows.length === 1 ? "" : "s"} stored in your workspace.`}
        actions={
          <>
            <Button variant="outline" onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Upload Complaint
            </Button>
            <Button onClick={() => setManualOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Manual Entry
            </Button>
          </>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by ID, customer or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["All", "Open", "In Review", "Resolved"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["All", "High", "Medium", "Low"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Complaint Channel" />
            </SelectTrigger>
            <SelectContent>
              {["All", ...channels].map((s) => (
                <SelectItem key={s} value={s}>{s === "All" ? "All channels" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.complaintId}>
                  <TableCell className="font-medium">{c.complaintId}</TableCell>
                  <TableCell className="whitespace-nowrap">{c.customer}</TableCell>
                  <TableCell className="whitespace-nowrap">{c.category}</TableCell>
                  <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{c.source}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{c.date}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/complaints/$complaintId" params={{ complaintId: c.complaintId }}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    {isLoading
                      ? "Loading complaints…"
                      : rows.length === 0
                        ? "No complaints yet — add one manually or upload a CSV to generate analysis."
                        : "No complaints match these filters."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <ComplaintUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={(f) => void handleUpload(f)}
        uploading={busy}
      />

      <ManualComplaintDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        onSubmit={(v) => void addManual(v)}
        submitting={busy}
      />
    </AppShell>
  );
}
