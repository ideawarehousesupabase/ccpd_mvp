import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, saveSession } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — CCPD" },
      { name: "description", content: "Log in to your CCPD complaint intelligence workspace." },
      { property: "og:title", content: "Log in — CCPD" },
      { property: "og:description", content: "Log in to your CCPD complaint intelligence workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      await saveSession(user);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials.");
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
          <h2 className="text-3xl font-semibold">Every complaint is an operational signal.</h2>
          <p className="mt-3 text-sm text-primary-foreground/75">
            CCPD groups scattered customer complaints into recurring patterns, traces them to root
            causes and tracks the fixes through to completion.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">Workspace analytics built from your complaint data</p>
      </div>

      <div className="flex items-center justify-center px-4 py-20 sm:px-12">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-bold">Log in</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Use the credentials you registered with.
          </p>
          {!isFirebaseConfigured ? (
            <p className="mt-4 rounded-lg bg-warning/15 px-3 py-2 text-xs text-warning-foreground">
              Firebase keys are missing from your .env file, so login cannot reach Firestore yet.
            </p>
          ) : null}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/change-password" className="text-xs font-medium text-primary hover:underline">
                  Change password
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Checking…" : "Log in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Go to Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}