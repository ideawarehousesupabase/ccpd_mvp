import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  complaintCategories,
  complaintPriorities,
  complaintStatuses,
} from "@/data/complaint-form";


const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  customer: "",
  text: "",
  category: "",
  branch: "",
  product: "",
  date: today(),
  priority: "Medium",
  status: "Open",
});

export type ManualComplaintValues = ReturnType<typeof emptyForm>;

export function ManualComplaintDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (values: ManualComplaintValues) => void;
  submitting?: boolean;
}) {
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);

  const set = (k: keyof ReturnType<typeof emptyForm>, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const missing = {
    customer: !form.customer.trim(),
    text: !form.text.trim(),
    category: !form.category,
    branch: !form.branch.trim(),
  };
  const invalid = (k: keyof typeof missing) => touched && missing[k];
  const errorRing = "border-destructive focus-visible:ring-destructive";

  const submit = () => {
    setTouched(true);
    if (Object.values(missing).some(Boolean)) return;
    onSubmit({
      ...form,
      customer: form.customer.trim(),
      text: form.text.trim(),
      branch: form.branch.trim(),
      product: form.product.trim(),
    });
    setForm(emptyForm());
    setTouched(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setTouched(false);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manual complaint entry</DialogTitle>
          <DialogDescription>
            Capture a single complaint using the same structure as the CSV import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-customer">Customer Name *</Label>
            <Input
              id="m-customer"
              value={form.customer}
              onChange={(e) => set("customer", e.target.value)}
              className={cn(invalid("customer") && errorRing)}
            />
            {invalid("customer") ? (
              <p className="text-xs text-destructive">Customer name is required.</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-text">Complaint Description *</Label>
            <Textarea
              id="m-text"
              rows={5}
              value={form.text}
              onChange={(e) => set("text", e.target.value)}
              className={cn(invalid("text") && errorRing)}
            />
            {invalid("text") ? (
              <p className="text-xs text-destructive">Complaint description is required.</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className={cn(invalid("category") && errorRing)}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {complaintCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {invalid("category") ? (
                <p className="text-xs text-destructive">Category is required.</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-branch">Branch / Location *</Label>
              <Input
                id="m-branch"
                value={form.branch}
                onChange={(e) => set("branch", e.target.value)}
                className={cn(invalid("branch") && errorRing)}
              />
              {invalid("branch") ? (
                <p className="text-xs text-destructive">Branch / location is required.</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-product">Product / Service</Label>
              <Input
                id="m-product"
                value={form.product}
                onChange={(e) => set("product", e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-date">Complaint Date</Label>
              <Input
                id="m-date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {complaintPriorities.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {complaintStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Saving…" : "Add Complaint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}