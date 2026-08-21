import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Radar,
  Network,
  Lightbulb,
  ListChecks,
  Package,
  BarChart3,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  Hotel,
  Boxes,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-dashboard.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CCPD — Turn complaints into operational fixes" },
      {
        name: "description",
        content:
          "CCPD detects recurring customer complaint patterns, traces them to operational root causes and tracks corrective actions to completion.",
      },
      { property: "og:title", content: "CCPD — Turn complaints into operational fixes" },
      {
        property: "og:description",
        content:
          "Detect complaint patterns, trace root causes and track corrective actions in one B2B workspace.",
      },
    ],
  }),
  component: Landing,
});

const benefits = [
  { icon: Radar, title: "Pattern detection", body: "Group scattered complaints into recurring, measurable operational patterns." },
  { icon: Network, title: "Root cause mapping", body: "Trace each pattern back to the department and process that produced it." },
  { icon: Lightbulb, title: "Actionable recommendations", body: "Get prioritised fixes with expected impact instead of raw ticket volume." },
  { icon: ListChecks, title: "Action tracking", body: "Assign owners, set implementation dates and watch complaints fall." },
  { icon: Package, title: "Packaging intelligence", body: "Compare packaging types on leakage, heat retention, durability and cost." },
  { icon: BarChart3, title: "Executive reporting", body: "Trends, refund impact and branch comparison in one shareable view." },
];

const steps = [
  { n: "01", title: "Collect", body: "Complaints arrive from your app, website, email and call centre into one queue." },
  { n: "02", title: "Detect", body: "CCPD clusters them into categories and surfaces the patterns that repeat." },
  { n: "03", title: "Diagnose", body: "Each pattern is mapped to root causes across kitchen, delivery, packaging and supply." },
  { n: "04", title: "Act", body: "Recommendations become tracked actions with owners, dates and expected impact." },
];

const industries = [
  { icon: UtensilsCrossed, label: "Restaurants & Food Delivery" },
  { icon: ShoppingBag, label: "E-commerce & Retail" },
  { icon: Truck, label: "Logistics & Courier" },
  { icon: Hotel, label: "Hospitality" },
  { icon: Boxes, label: "Consumer Packaged Goods" },
  { icon: Headphones, label: "Telecom & Services" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">CCPD</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="hero-gradient">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="text-primary-foreground">
            <span className="inline-flex rounded-full bg-primary-foreground/12 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Customer Complaint Pattern Detector
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Your complaints already know what is broken.
            </h1>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/80">
              CCPD turns scattered customer complaints into recurring operational patterns, maps
              them to root causes and tracks the corrective actions that make them disappear.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/register">Get started free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/12">
                <Link to="/login">Login to workspace</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-primary-foreground">
              {[
                ["23.6%", "Complaint reduction"],
                ["6", "Root cause domains"],
                ["4", "Packaging profiles"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-2xl font-semibold">{v}</dt>
                  <dd className="text-xs text-primary-foreground/70">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <img
            src={heroImage}
            alt="CCPD analytics dashboard showing complaint trends and categories"
            width={1280}
            height={900}
            className="w-full rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">One workspace for complaint intelligence</h2>
          <p className="mt-3 text-muted-foreground">
            Support teams close tickets. Operations teams need to know why the same ticket keeps
            coming back. CCPD sits between the two and makes the pattern visible.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="surface-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold">How CCPD works</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="surface-card p-6">
                <span className="font-display text-sm font-semibold text-primary">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-semibold">Industries served</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Any operation where a repeated complaint costs a refund, a review or a customer.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((i) => (
            <div key={i.label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
              <i.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{i.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="hero-gradient flex flex-col items-start gap-6 rounded-3xl px-8 py-12 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">See the patterns in your complaints</h2>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Create an account and explore the full CCPD workflow.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">Sign Up</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/12">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 CCPD — Customer Complaint Pattern Detector</span>
          <span>Analytics generated from your own complaint records</span>
        </div>
      </footer>
    </div>
  );
}
