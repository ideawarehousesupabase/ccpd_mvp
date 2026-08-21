import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";

export const Route = createFileRoute("/change-password")({
  head: () => ({
    meta: [
      { title: "Change password — CCPD" },
      { name: "description", content: "Update the password for your CCPD workspace account." },
      { property: "og:title", content: "Change password — CCPD" },
      { property: "og:description", content: "Update the password for your CCPD workspace account." },
    ],
  }),
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", current: "", next: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.current || !form.next) {
      toast.error("Please fill in every field.");
      return;
    }
    if (form.next.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (form.next !== form.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(form.email, form.current, form.next);
      toast.success("Password updated. Please log in.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change the password.");
    } finally {
      setLoading(false);
    }
  };

  const type = show ? "text" : "password";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hero-gradient hidden flex-col justify-between p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 text-primary-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/15">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold">CCPD</span>
        </Link>
        <div className="max-w-md text-primary-foreground">
          <h2 className="text-3xl font-semibold">Keep your workspace secure.</h2>
          <p className="mt-3 text-sm text-primary-foreground/75">
            Confirm your current password to set a new one for your CCPD account.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">Workspace analytics built from your complaint data</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold">Change password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify your current password, then choose a new one.
          </p>
          {!isFirebaseConfigured ? (
            <p className="mt-4 rounded-lg bg-warning/15 px-3 py-2 text-xs text-warning-foreground">
              Firebase keys are missing from your .env file, so passwords cannot be updated yet.
            </p>
          ) : null}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-email">Email</Label>
              <Input id="cp-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" />
            </div>
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {show ? "Hide passwords" : "Show passwords"}
            </button>
            <div className="space-y-1.5">
              <Label htmlFor="cp-current">Current password</Label>
              <Input id="cp-current" type={type} value={form.current} onChange={(e) => set("current", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-next">New password</Label>
              <Input id="cp-next" type={type} value={form.next} onChange={(e) => set("next", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-confirm">Confirm new password</Label>
              <Input id="cp-confirm" type={type} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}