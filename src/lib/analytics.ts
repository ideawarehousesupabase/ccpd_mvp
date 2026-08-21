import type {
  DashboardMetrics,
  KeyedAction,
  KeyedComplaint,
  KeyedRootCause,
  ReportSnapshot,
} from "./ccpd-types";
import { ruleFor } from "./rule-engine";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthKey(date: string) {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? MONTHS[new Date().getMonth()]! : MONTHS[d.getMonth()]!;
}

function lastMonths(count: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(MONTHS[d.getMonth()]!);
  }
  return out;
}

function pct(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function buildTrend(complaints: KeyedComplaint[]) {
  const months = lastMonths(6);
  return months.map((m) => {
    const inMonth = complaints.filter((c) => monthKey(c.date) === m);
    return {
      month: m,
      complaints: inMonth.length,
      resolved: inMonth.filter((c) => c.status === "Resolved").length,
    };
  });
}

export function buildCategoryBreakdown(complaints: KeyedComplaint[]) {
  const map = new Map<string, number>();
  complaints.forEach((c) => map.set(c.category, (map.get(c.category) ?? 0) + 1));
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** Ratio of completed corrective actions per complaint category. */
function completionByCategory(actions: KeyedAction[]) {
  const map = new Map<string, { total: number; done: number }>();
  actions.forEach((a) => {
    const entry = map.get(a.category) ?? { total: 0, done: 0 };
    entry.total += 1;
    if (a.status === "Completed") entry.done += 1;
    map.set(a.category, entry);
  });
  return map;
}

export function buildDashboardMetrics(
  userId: string,
  complaints: KeyedComplaint[],
  actions: KeyedAction[],
): DashboardMetrics {
  const total = complaints.length;
  const open = complaints.filter((c) => c.status === "Open").length;
  const inReview = complaints.filter((c) => c.status === "In Review").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const highPriority = complaints.filter((c) => c.priority === "High").length;
  const completedActions = actions.filter((a) => a.status === "Completed").length;
  const improved = completedActions > 0;
  const completion = completionByCategory(actions);

  const categoryBreakdown = buildCategoryBreakdown(complaints);

  const outcomeTracking = categoryBreakdown.slice(0, 4).map((c) => {
    const rule = ruleFor(c.name);
    const entry = completion.get(c.name) ?? { total: 0, done: 0 };
    const ratio = entry.total === 0 ? 0 : entry.done / entry.total;
    const after = Math.max(0, Math.round(c.value * (1 - (rule.reduction / 100) * ratio)));
    const improvement = c.value === 0 ? 0 : Math.round(((c.value - after) / c.value) * 100);
    return {
      id: c.name,
      label: c.name,
      before: c.value,
      after,
      improvement: `${improvement}%`,
      progress: Math.round(ratio * 100),
    };
  });

  const resolutionRate = pct(resolved, total);
  const actionCompletion = pct(completedActions, actions.length);
  const openLoad = 100 - pct(open, total || 1);
  const priorityLoad = 100 - pct(highPriority, total || 1);
  const score = Math.round((resolutionRate + actionCompletion + openLoad + priorityLoad) / 4);
  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Healthy" : score >= 50 ? "Fair" : "At risk";

  return {
    userId,
    updatedAt: new Date().toISOString(),
    totals: { total, open, inReview, resolved, highPriority },
    kpis: [
      { label: "Total Complaints", value: String(total), hint: "recorded in your workspace" },
      {
        label: "Open Complaints",
        value: String(open),
        hint: "awaiting first response",
        ...(total ? { delta: `${pct(open, total)}% of total` } : {}),
      },
      {
        label: "Resolution Rate",
        value: `${resolutionRate}%`,
        positive: resolutionRate >= 50,
        delta: `${resolved} resolved`,
        hint: "complaints closed",
      },
      {
        label: "Actions Completed",
        value: `${completedActions}/${actions.length}`,
        positive: improved,
        delta: `${actionCompletion}% complete`,
        hint: "corrective actions",
      },
    ],
    categoryBreakdown,
    complaintTrend: buildTrend(complaints),
    operationalHealth: [
      { area: "Resolution", score: resolutionRate },
      { area: "Action Delivery", score: actionCompletion },
      { area: "Backlog Control", score: openLoad },
      { area: "Risk Exposure", score: priorityLoad },
    ],
    businessHealth: {
      score,
      grade,
      breakdown: [
        { label: "Resolution rate", value: resolutionRate },
        { label: "Action completion", value: actionCompletion },
        { label: "Backlog control", value: openLoad },
        { label: "Risk exposure", value: priorityLoad },
      ],
    },
    outcomeTracking,
    recentActivity: [...complaints]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6)
      .map((c) => ({
        id: c.complaintId,
        text: `${c.complaintId} · ${c.category} reported by ${c.customer}`,
        time: relativeTime(c.createdAt),
      })),
    improved,
  };
}

export function buildReportSnapshot(
  userId: string,
  complaints: KeyedComplaint[],
  actions: KeyedAction[],
  rootCauses: KeyedRootCause[],
): ReportSnapshot {
  const months = lastMonths(6);
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  const refundImpact = months.map((m) => ({
    month: m,
    refunds: complaints
      .filter((c) => monthKey(c.date) === m)
      .reduce((sum, c) => sum + ruleFor(c.category).refundCost, 0),
  }));

  const operationalPerformance = months.map((m) => {
    const inMonth = complaints.filter((c) => monthKey(c.date) === m);
    const late = inMonth.filter((c) => c.category === "Late Delivery").length;
    const inaccurate = inMonth.filter(
      (c) => c.category === "Order Accuracy" || c.category === "Missing Items",
    ).length;
    return {
      month: m,
      onTime: Math.max(60, 100 - late * 4),
      accuracy: Math.max(60, 100 - inaccurate * 4),
    };
  });

  const branchMap = new Map<string, { complaints: number; resolved: number }>();
  complaints.forEach((c) => {
    const key = c.branch || "Unassigned";
    const e = branchMap.get(key) ?? { complaints: 0, resolved: 0 };
    e.complaints += 1;
    if (c.status === "Resolved") e.resolved += 1;
    branchMap.set(key, e);
  });

  const rcMap = new Map<string, number>();
  rootCauses.forEach((r) => rcMap.set(r.rootCause, (rcMap.get(r.rootCause) ?? 0) + 1));
  const rcTotal = rootCauses.length || 1;

  const refundTotal = refundImpact.reduce((s, r) => s + r.refunds, 0);

  return {
    userId,
    updatedAt: new Date().toISOString(),
    complaintTrend: buildTrend(complaints),
    categoryBreakdown: buildCategoryBreakdown(complaints),
    refundImpact,
    operationalPerformance,
    branchComparison: [...branchMap.entries()]
      .map(([branch, v]) => ({ branch, ...v }))
      .sort((a, b) => b.complaints - a.complaints)
      .slice(0, 8),
    operationalSummary: [
      { label: "Total complaints", value: String(total) },
      { label: "Resolution rate", value: `${pct(resolved, total)}%` },
      { label: "Corrective actions", value: String(actions.length) },
      {
        label: "Actions completed",
        value: String(actions.filter((a) => a.status === "Completed").length),
      },
      { label: "Estimated refund exposure", value: `$${refundTotal.toLocaleString()}` },
      { label: "Distinct root causes", value: String(rcMap.size) },
    ],
    rootCauseRanking: [...rcMap.entries()]
      .map(([name, count]) => ({ name, count, percent: Math.round((count / rcTotal) * 100) }))
      .sort((a, b) => b.count - a.count),
    resolutionStats: [
      { label: "Open", value: String(complaints.filter((c) => c.status === "Open").length) },
      { label: "In Review", value: String(complaints.filter((c) => c.status === "In Review").length) },
      { label: "Resolved", value: String(resolved) },
    ],
  };
}
