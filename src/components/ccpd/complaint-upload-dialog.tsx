import { useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { complaintCategories } from "@/data/complaint-form";
import { CSV_TEMPLATE } from "@/lib/csv";

const columns: Array<[string, string]> = [
  ["Customer Name", "Name of the customer"],
  ["Complaint Description", "Detailed complaint text"],
  ["Category", "Complaint category"],
  ["Branch / Location", "Branch where the complaint occurred"],
  ["Product / Service", "Product or service involved"],
  ["Complaint Date", "Date of complaint"],
  ["Priority", "High / Medium / Low"],
  ["Status", "Defaults to Open if omitted"],
];

export function ComplaintUploadDialog({
  open,
  onOpenChange,
  onUpload,
  uploading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpload: (file: File) => void;
  uploading?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const fileName = file?.name ?? null;
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (f: File | null | undefined) => {
    if (f && f.name.toLowerCase().endsWith(".csv")) setFile(f);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Complaint CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing customer complaint records. The uploaded complaint data
            will later be used by CCPD to automatically generate insights across the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="rounded-lg border border-border">
            <header className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Required CSV Columns</h3>
            </header>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns.map(([col, desc]) => (
                    <TableRow key={col}>
                      <TableCell className="whitespace-nowrap font-medium">{col}</TableCell>
                      <TableCell className="text-muted-foreground">{desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
              Complaint ID will be generated automatically.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Supported Categories</h3>
            <div className="flex flex-wrap gap-2">
              {complaintCategories.map((c) => (
                <Badge key={c} variant="outline">{c}</Badge>
              ))}
            </div>
          </section>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pick(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors",
              dragging && "border-primary bg-primary/5",
            )}
          >
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              Choose CSV File
            </Button>
            <button
              type="button"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "ccpd-complaints-template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download CSV template
            </button>
            <p className="text-xs text-muted-foreground">or Drag &amp; Drop CSV Here</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
            {fileName ? (
              <p className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" /> {fileName}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => file && onUpload(file)} disabled={!file || uploading}>
            {uploading ? "Processing…" : "Upload CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}