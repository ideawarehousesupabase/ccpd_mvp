export type Priority = "High" | "Medium" | "Low";
export type ComplaintStatus = "Open" | "In Review" | "Resolved";
export type WorkStatus = "Pending" | "In Progress" | "Completed";

export type ComplaintInput = {
  customer: string;
  text: string;
  category: string;
  branch: string;
  product?: string;
  source: string;
  priority?: Priority;
  status?: ComplaintStatus;
  date?: string;
};

export type Complaint = {
  complaintId: string;
  userId: string;
  customer: string;
  text: string;
  category: string;
  branch: string;
  product: string;
  source: string;
  priority: Priority;
  status: ComplaintStatus;
  date: string;
  department: string;
  createdAt: string;
};

export type RootCauseRecord = {
  complaintId: string;
  userId: string;
  category: string;
  rootCause: string;
  description: string;
  confidence: number;
  severity: Priority;
  status: WorkStatus;
  createdAt: string;
};

export type RecommendationRecord = {
  complaintId: string;
  userId: string;
  problem: string;
  recommendation: string;
  priority: Priority;
  impact: string;
  timeline: string;
  steps: string[];
  businessImpact: string;
  department: string;
  category: string;
  status: WorkStatus;
  createdAt: string;
};

export type ActionRecord = {
  complaintId: string;
  userId: string;
  recommendation: string;
  action: string;
  department: string;
  category: string;
  status: WorkStatus;
  expectedCompletion: string;
  implementationDate: string | null;
  progress: number;
  impact: string;
  createdAt: string;
};

export type PackagingRecord = {
  complaintId: string;
  userId: string;
  category: string;
  packagingType: string;
  summary: string;
  useCases: string[];
  metrics: Record<string, number>;
  createdAt: string;
};

export type KeyedComplaint = Complaint & { id: string };
export type KeyedRootCause = RootCauseRecord & { id: string };
export type KeyedRecommendation = RecommendationRecord & { id: string };
export type KeyedAction = ActionRecord & { id: string };
export type KeyedPackaging = PackagingRecord & { id: string };

export type DashboardMetrics = {
  userId: string;
  updatedAt: string;
  kpis: { label: string; value: string; delta?: string; positive?: boolean; hint?: string }[];
  totals: { total: number; open: number; inReview: number; resolved: number; highPriority: number };
  categoryBreakdown: { name: string; value: number }[];
  complaintTrend: { month: string; complaints: number; resolved: number }[];
  operationalHealth: { area: string; score: number }[];
  businessHealth: { score: number; grade: string; breakdown: { label: string; value: number }[] };
  outcomeTracking: {
    id: string;
    label: string;
    before: number;
    after: number;
    improvement: string;
    progress: number;
  }[];
  recentActivity: { id: string; text: string; time: string }[];
  improved: boolean;
};

export type ReportSnapshot = {
  userId: string;
  updatedAt: string;
  complaintTrend: { month: string; complaints: number; resolved: number }[];
  categoryBreakdown: { name: string; value: number }[];
  refundImpact: { month: string; refunds: number }[];
  operationalPerformance: { month: string; onTime: number; accuracy: number }[];
  branchComparison: { branch: string; complaints: number; resolved: number }[];
  operationalSummary: { label: string; value: string }[];
  rootCauseRanking: { name: string; count: number; percent: number }[];
  resolutionStats: { label: string; value: string }[];
};
