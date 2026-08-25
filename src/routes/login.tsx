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

      <div className="flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl sm:p-10 border border-border">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the credentials you registered with.
          </p>
          {!isFirebaseConfigured ? (
            <p className="mt-4 rounded-xl bg-warning/15 p-3 text-xs text-warning-foreground">
              Firebase keys are missing from your .env file, so login cannot reach Firestore yet.
            </p>
          ) : null}
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email ID</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                autoComplete="off"
                placeholder="Enter Email ID"
                className="h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Link to="/change-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  placeholder="Enter password"
                  className="h-12 rounded-xl pr-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="mt-8 w-full h-12 rounded-xl text-lg font-semibold shadow-md" disabled={loading}>
              {loading ? "Checking…" : "Login"}
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