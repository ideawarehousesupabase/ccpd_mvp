import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your CCPD account" },
      { name: "description", content: "Register your business to start detecting complaint patterns with CCPD." },
      { property: "og:title", content: "Create your CCPD account" },
      { property: "og:description", content: "Register your business to start detecting complaint patterns with CCPD." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.businessName.trim() || !form.email.trim()) {
      toast.error("Please fill in every field.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(form);
      toast.success("Account created. Please log in.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-3xl font-semibold">Set up your complaint intelligence workspace.</h2>
          <p className="mt-3 text-sm text-primary-foreground/75">
            Register your business once and get a dashboard of complaint patterns, root causes,
            recommendations and packaging intelligence.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">Workspace analytics built from your complaint data</p>
      </div>

      <div className="flex items-center justify-center px-4 py-20 sm:px-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold">Create your account</h1>
          <p className="mt-3 text-base text-muted-foreground">It takes less than a minute.</p>
          {!isFirebaseConfigured ? (
            <p className="mt-4 rounded-lg bg-warning/15 px-3 py-2 text-xs text-warning-foreground">
              Firebase keys are missing from your .env file, so sign-up cannot reach Firestore yet.
            </p>
          ) : null}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="business">Business name</Label>
              <Input id="business" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="off" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPassword ? "Hide passwords" : "Show passwords"}
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pwd">Password</Label>
                <Input id="pwd" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type={showPassword ? "text" : "password"} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} autoComplete="new-password" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}