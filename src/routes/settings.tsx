import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/ccpd/app-shell";
import { PageHeader } from "@/components/ccpd/page-header";
import { Panel } from "@/components/ccpd/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { clearSession } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CCPD" },
      { name: "description", content: "Manage your CCPD profile information, password and account session." },
      { property: "og:title", content: "Settings — CCPD" },
      { property: "og:description", content: "Manage your CCPD profile information, password and account session." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd.current || !pwd.next) {
      toast.error("Fill in both password fields.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    toast.success("Password change simulated in this prototype.");
  };

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Your profile, security options and account actions." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Profile Information" description="Captured at registration">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={user?.name ?? ""} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Business name</Label>
              <Input value={user?.businessName ?? ""} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Input value={user?.industry ?? ""} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly />
            </div>
          </div>
        </Panel>

        <Panel title="Security" description="Change your password">
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cur">Current password</Label>
              <Input id="cur" type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="conf">Confirm new password</Label>
              <Input id="conf" type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} />
            </div>
            <Button type="submit">Update password</Button>
          </form>
        </Panel>
      </div>

      <Panel title="Account" description="End your session on this device">
        <Button
          variant="destructive"
          onClick={() => {
            clearSession();
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </Button>
      </Panel>
    </AppShell>
  );
}