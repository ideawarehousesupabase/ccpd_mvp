import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { analyzeComplaint } from "./rule-engine";
import { buildDashboardMetrics, buildReportSnapshot } from "./analytics";
import type {
  ComplaintInput,
  DashboardMetrics,
  KeyedAction,
  KeyedComplaint,
  KeyedPackaging,
  KeyedRecommendation,
  KeyedRootCause,
  ReportSnapshot,
  WorkStatus,
} from "./ccpd-types";

export const COLLECTIONS = {
  complaints: "complaints",
  rootCauses: "rootCauseAnalysis",
  recommendations: "recommendations",
  actions: "actionTracker",
  packaging: "packagingAnalysis",
  metrics: "dashboardMetrics",
  reports: "reports",
} as const;

async function listByUser<T>(name: string, userId: string): Promise<(T & { id: string })[]> {
  const snap = await getDocs(query(collection(getDb(), name), where("userId", "==", userId)));
  return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
}

export const listComplaints = (userId: string) =>
  listByUser<KeyedComplaint>(COLLECTIONS.complaints, userId).then((rows) =>
    rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
export const listRootCauses = (userId: string) =>
  listByUser<KeyedRootCause>(COLLECTIONS.rootCauses, userId);
export const listRecommendations = (userId: string) =>
  listByUser<KeyedRecommendation>(COLLECTIONS.recommendations, userId);
export const listActions = (userId: string) =>
  listByUser<KeyedAction>(COLLECTIONS.actions, userId);
export const listPackaging = (userId: string) =>
  listByUser<KeyedPackaging>(COLLECTIONS.packaging, userId);

export async function getComplaint(userId: string, complaintId: string) {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.complaints, `${userId}_${complaintId}`));
  return snap.exists() ? ({ ...(snap.data() as KeyedComplaint), id: snap.id }) : null;
}

async function readLinked<T>(name: string, userId: string, complaintId: string) {
  const snap = await getDoc(doc(getDb(), name, `${userId}_${complaintId}`));
  return snap.exists() ? ({ ...(snap.data() as T), id: snap.id }) : null;
}

export async function getComplaintBundle(userId: string, complaintId: string) {
  const [complaint, rootCause, recommendation, action, packaging] = await Promise.all([
    getComplaint(userId, complaintId),
    readLinked<KeyedRootCause>(COLLECTIONS.rootCauses, userId, complaintId),
    readLinked<KeyedRecommendation>(COLLECTIONS.recommendations, userId, complaintId),
    readLinked<KeyedAction>(COLLECTIONS.actions, userId, complaintId),
    readLinked<KeyedPackaging>(COLLECTIONS.packaging, userId, complaintId),
  ]);
  return { complaint, rootCause, recommendation, action, packaging };
}

function nextIds(existing: KeyedComplaint[], count: number) {
  const highest = existing.reduce((max, c) => {
    const n = Number(c.complaintId.replace(/\D/g, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 1000);
  return Array.from({ length: count }, (_, i) => `CMP-${highest + i + 1}`);
}

/**
 * Stores complaints and every rule-generated downstream record in one batch,
 * then refreshes the persisted dashboard and report snapshots.
 */
export async function createComplaints(userId: string, inputs: ComplaintInput[]) {
  if (inputs.length === 0) return [];
  const db = getDb();
  const existing = await listComplaints(userId);
  const ids = nextIds(existing, inputs.length);
  const batch = writeBatch(db);

  const results = inputs.map((input, i) => {
    const complaintId = ids[i]!;
    const bundle = analyzeComplaint(input, { complaintId, userId });
    const key = `${userId}_${complaintId}`;
    batch.set(doc(db, COLLECTIONS.complaints, key), bundle.complaint);
    batch.set(doc(db, COLLECTIONS.rootCauses, key), bundle.rootCause);
    batch.set(doc(db, COLLECTIONS.recommendations, key), bundle.recommendation);
    batch.set(doc(db, COLLECTIONS.actions, key), bundle.action);
    batch.set(doc(db, COLLECTIONS.packaging, key), bundle.packaging);
    return bundle;
  });

  await batch.commit();
  await recomputeAnalytics(userId);
  return results;
}

export async function updateActionStatus(
  userId: string,
  complaintId: string,
  status: WorkStatus,
) {
  const db = getDb();
  const key = `${userId}_${complaintId}`;
  const progress = status === "Completed" ? 100 : status === "In Progress" ? 50 : 0;
  await Promise.all([
    updateDoc(doc(db, COLLECTIONS.actions, key), {
      status,
      progress,
      implementationDate: status === "Completed" ? new Date().toISOString().slice(0, 10) : null,
    }),
    updateDoc(doc(db, COLLECTIONS.recommendations, key), { status }),
    updateDoc(doc(db, COLLECTIONS.rootCauses, key), { status }),
    updateDoc(doc(db, COLLECTIONS.complaints, key), {
      status: status === "Completed" ? "Resolved" : status === "In Progress" ? "In Review" : "Open",
    }),
  ]);
  await recomputeAnalytics(userId);
}

export async function updateComplaintStatus(
  userId: string,
  complaintId: string,
  status: KeyedComplaint["status"],
) {
  await updateDoc(doc(getDb(), COLLECTIONS.complaints, `${userId}_${complaintId}`), { status });
  await recomputeAnalytics(userId);
}

/** Recomputes and persists dashboardMetrics + reports for the user. */
export async function recomputeAnalytics(userId: string) {
  const db = getDb();
  const [complaints, actions, rootCauses] = await Promise.all([
    listComplaints(userId),
    listActions(userId),
    listRootCauses(userId),
  ]);
  const metrics = buildDashboardMetrics(userId, complaints, actions);
  const report = buildReportSnapshot(userId, complaints, actions, rootCauses);
  await Promise.all([
    setDoc(doc(db, COLLECTIONS.metrics, userId), metrics),
    setDoc(doc(db, COLLECTIONS.reports, userId), report),
  ]);
  return { metrics, report };
}

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.metrics, userId));
  if (snap.exists()) return snap.data() as DashboardMetrics;
  return (await recomputeAnalytics(userId)).metrics;
}

export async function getReportSnapshot(userId: string): Promise<ReportSnapshot> {
  const snap = await getDoc(doc(getDb(), COLLECTIONS.reports, userId));
  if (snap.exists()) return snap.data() as ReportSnapshot;
  return (await recomputeAnalytics(userId)).report;
}
