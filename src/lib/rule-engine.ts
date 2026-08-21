import type {
  ActionRecord,
  Complaint,
  ComplaintInput,
  PackagingRecord,
  Priority,
  RecommendationRecord,
  RootCauseRecord,
} from "./ccpd-types";

export const packagingMetricKeys = [
  "Leakage Resistance",
  "Heat Retention",
  "Delivery Durability",
  "Customer Satisfaction",
  "Sustainability",
  "Cost Effectiveness",
] as const;

export type PackagingProfile = {
  name: string;
  summary: string;
  useCases: string[];
  metrics: Record<string, number>;
};

/** Static packaging catalogue used by the rule engine. */
export const packagingProfiles: Record<string, PackagingProfile> = {
  "Insulated Box": {
    name: "Insulated Box",
    summary: "Thermal-lined box that holds serving temperature across longer delivery routes.",
    useCases: ["Hot meals", "Long-distance delivery", "Peak-hour orders"],
    metrics: {
      "Leakage Resistance": 74,
      "Heat Retention": 93,
      "Delivery Durability": 86,
      "Customer Satisfaction": 88,
      Sustainability: 62,
      "Cost Effectiveness": 58,
    },
  },
  "Leak-proof Container": {
    name: "Leak-proof Container",
    summary: "Sealed container with a locking lid designed to eliminate spillage in transit.",
    useCases: ["Soups & curries", "Sauces and liquids", "Bike courier routes"],
    metrics: {
      "Leakage Resistance": 96,
      "Heat Retention": 71,
      "Delivery Durability": 89,
      "Customer Satisfaction": 90,
      Sustainability: 55,
      "Cost Effectiveness": 64,
    },
  },
  "Paper Box": {
    name: "Paper Box",
    summary: "Low-cost recyclable box suited to dry goods and short delivery windows.",
    useCases: ["Dry snacks", "Bakery items", "Takeaway counter orders"],
    metrics: {
      "Leakage Resistance": 42,
      "Heat Retention": 48,
      "Delivery Durability": 55,
      "Customer Satisfaction": 62,
      Sustainability: 92,
      "Cost Effectiveness": 88,
    },
  },
  "Plastic Container": {
    name: "Plastic Container",
    summary: "General-purpose rigid container balancing cost with everyday protection.",
    useCases: ["Standard meals", "Mixed orders", "High-volume outlets"],
    metrics: {
      "Leakage Resistance": 78,
      "Heat Retention": 60,
      "Delivery Durability": 74,
      "Customer Satisfaction": 70,
      Sustainability: 34,
      "Cost Effectiveness": 82,
    },
  },
};

export type BusinessRule = {
  rootCause: string;
  rootCauseDescription: string;
  confidence: number;
  severity: Priority;
  department: string;
  problem: string;
  recommendation: string;
  impact: string;
  timeline: string;
  weeksToImplement: number;
  steps: string[];
  businessImpact: string;
  action: string;
  packaging: string;
  refundCost: number;
  /** Expected complaint reduction (%) once the action is completed. */
  reduction: number;
};

/**
 * Predefined business rules. Swapping this map (or the engine below) is the only
 * change required to move from rule-based analysis to another provider later.
 */
export const RULES: Record<string, BusinessRule> = {
  "Food Temperature": {
    rootCause: "Poor Packaging Insulation",
    rootCauseDescription:
      "Meals lose serving temperature in transit because current packaging provides no thermal barrier.",
    confidence: 92,
    severity: "High",
    department: "Operations",
    problem: "Food arriving cold or lukewarm",
    recommendation: "Switch hot meals to insulated packaging",
    impact: "Up to 35% reduction in temperature complaints",
    timeline: "5 weeks",
    weeksToImplement: 5,
    steps: [
      "Audit temperature loss across the three longest delivery routes",
      "Trial insulated boxes in two high-volume branches",
      "Compare complaint volume before and after the trial",
      "Roll out insulated packaging network-wide",
    ],
    businessImpact: "Protects repeat orders in the highest-value dinner window.",
    action: "Pilot insulated containers on hot-meal orders",
    packaging: "Insulated Box",
    refundCost: 14,
    reduction: 35,
  },
  "Packaging Leakage": {
    rootCause: "Weak Container Sealing",
    rootCauseDescription:
      "Lids do not lock, so liquid-based items spill during handling and transport.",
    confidence: 94,
    severity: "High",
    department: "Packaging",
    problem: "Spillage and leaking containers on delivery",
    recommendation: "Adopt leak-proof containers for liquid items",
    impact: "Up to 45% reduction in spillage complaints",
    timeline: "4 weeks",
    weeksToImplement: 4,
    steps: [
      "Identify menu items most affected by spillage",
      "Test locking-lid containers with courier partners",
      "Update packing instructions for kitchen staff",
      "Replace legacy containers across all branches",
    ],
    businessImpact: "Cuts refunds and re-deliveries caused by damaged orders.",
    action: "Replace open-lid containers with sealed units",
    packaging: "Leak-proof Container",
    refundCost: 18,
    reduction: 45,
  },
  "Late Delivery": {
    rootCause: "Inefficient Dispatch Scheduling",
    rootCauseDescription:
      "Riders are assigned without route batching, creating avoidable delays at peak hours.",
    confidence: 88,
    severity: "High",
    department: "Logistics",
    problem: "Orders delivered outside the promised window",
    recommendation: "Introduce peak-hour dispatch batching",
    impact: "Up to 30% improvement in on-time delivery",
    timeline: "6 weeks",
    weeksToImplement: 6,
    steps: [
      "Map delivery delays by hour and zone",
      "Add a dedicated dispatcher for peak windows",
      "Batch orders by delivery corridor",
      "Publish a weekly on-time performance review",
    ],
    businessImpact: "Improves delivery reliability, the strongest driver of retention.",
    action: "Restructure rider dispatch during peak hours",
    packaging: "Insulated Box",
    refundCost: 11,
    reduction: 30,
  },
  "Food Quality": {
    rootCause: "Inconsistent Kitchen Standards",
    rootCauseDescription:
      "Preparation varies between shifts because recipe checks are not enforced consistently.",
    confidence: 86,
    severity: "High",
    department: "Kitchen",
    problem: "Inconsistent taste and preparation quality",
    recommendation: "Enforce standardised recipe and quality checks",
    impact: "Up to 28% reduction in quality complaints",
    timeline: "5 weeks",
    weeksToImplement: 5,
    steps: [
      "Document recipe standards for the top 20 items",
      "Add a shift-level quality checklist",
      "Run refresher training for kitchen leads",
      "Sample-audit 10 orders per shift",
    ],
    businessImpact: "Stabilises the core product experience across branches.",
    action: "Deploy shift quality checklists in every kitchen",
    packaging: "Plastic Container",
    refundCost: 16,
    reduction: 28,
  },
  "Order Accuracy": {
    rootCause: "Manual Order Handling Errors",
    rootCauseDescription:
      "Orders are assembled without a verification step, so items are swapped or omitted.",
    confidence: 90,
    severity: "Medium",
    department: "Operations",
    problem: "Wrong or incomplete orders delivered",
    recommendation: "Add a pre-dispatch order verification step",
    impact: "Up to 40% reduction in accuracy complaints",
    timeline: "3 weeks",
    weeksToImplement: 3,
    steps: [
      "Introduce a printed pack list per order",
      "Require a second-person check before sealing",
      "Track error rate by shift",
      "Coach outliers weekly",
    ],
    businessImpact: "Reduces refunds and redelivery cost per order.",
    action: "Roll out double-check packing procedure",
    packaging: "Plastic Container",
    refundCost: 13,
    reduction: 40,
  },
  "Missing Items": {
    rootCause: "Incomplete Packing Process",
    rootCauseDescription:
      "Packers work without a structured checklist, so add-ons and sides are left behind.",
    confidence: 89,
    severity: "Medium",
    department: "Operations",
    problem: "Items missing from delivered orders",
    recommendation: "Introduce checklist-based packing",
    impact: "Up to 38% reduction in missing-item reports",
    timeline: "3 weeks",
    weeksToImplement: 3,
    steps: [
      "Generate an itemised checklist with each order ticket",
      "Mark off items at the packing station",
      "Audit sealed orders at random",
      "Review missing-item trends weekly",
    ],
    businessImpact: "Lowers goodwill credits issued to customers.",
    action: "Implement itemised packing checklists",
    packaging: "Paper Box",
    refundCost: 12,
    reduction: 38,
  },
  "Refund Delay": {
    rootCause: "Slow Refund Approval Workflow",
    rootCauseDescription:
      "Refunds wait on manual approval, extending resolution far beyond customer expectations.",
    confidence: 87,
    severity: "Medium",
    department: "Customer Service",
    problem: "Refunds taking too long to process",
    recommendation: "Auto-approve low-value refunds",
    impact: "Refund turnaround cut by up to 60%",
    timeline: "4 weeks",
    weeksToImplement: 4,
    steps: [
      "Define an auto-approval threshold",
      "Give agents direct refund authority below the threshold",
      "Notify customers automatically on approval",
      "Report refund turnaround weekly",
    ],
    businessImpact: "Removes the largest source of escalations and negative reviews.",
    action: "Enable instant refunds below the approval threshold",
    packaging: "Paper Box",
    refundCost: 20,
    reduction: 32,
  },
  "Staff Behaviour": {
    rootCause: "Insufficient Service Training",
    rootCauseDescription:
      "Frontline and delivery staff lack a consistent script for handling difficult interactions.",
    confidence: 83,
    severity: "Medium",
    department: "Human Resources",
    problem: "Unprofessional or unhelpful service interactions",
    recommendation: "Run structured customer-service training",
    impact: "Up to 25% reduction in behaviour complaints",
    timeline: "6 weeks",
    weeksToImplement: 6,
    steps: [
      "Review recorded complaint interactions",
      "Build a service-recovery script",
      "Train all customer-facing staff",
      "Add service scores to shift reviews",
    ],
    businessImpact: "Improves review ratings and repeat-order rate.",
    action: "Deliver service-recovery training programme",
    packaging: "Paper Box",
    refundCost: 8,
    reduction: 25,
  },
  Hygiene: {
    rootCause: "Gaps in Hygiene Compliance",
    rootCauseDescription:
      "Cleaning and handling routines are not verified, allowing hygiene issues to reach customers.",
    confidence: 91,
    severity: "High",
    department: "Quality Assurance",
    problem: "Hygiene and cleanliness concerns reported",
    recommendation: "Introduce daily hygiene audits",
    impact: "Up to 42% reduction in hygiene complaints",
    timeline: "4 weeks",
    weeksToImplement: 4,
    steps: [
      "Publish a daily hygiene checklist per station",
      "Assign a shift hygiene owner",
      "Run unannounced weekly inspections",
      "Escalate repeat failures to branch management",
    ],
    businessImpact: "Protects the business from regulatory and reputational risk.",
    action: "Launch daily hygiene audit routine",
    packaging: "Leak-proof Container",
    refundCost: 17,
    reduction: 42,
  },
  Others: {
    rootCause: "Uncategorised Operational Gap",
    rootCauseDescription:
      "The complaint does not match a known pattern and needs manual operational review.",
    confidence: 65,
    severity: "Low",
    department: "Operations",
    problem: "Miscellaneous operational issue",
    recommendation: "Review manually and assign an owner",
    impact: "Prevents unclassified issues from becoming recurring patterns",
    timeline: "2 weeks",
    weeksToImplement: 2,
    steps: [
      "Review the complaint with the branch manager",
      "Classify the underlying operational area",
      "Define a corrective action owner",
      "Add the pattern to the category list if it repeats",
    ],
    businessImpact: "Keeps emerging issues visible before they scale.",
    action: "Manual operational review",
    packaging: "Paper Box",
    refundCost: 9,
    reduction: 15,
  },
};

export function ruleFor(category: string): BusinessRule {
  return RULES[category] ?? RULES["Others"]!;
}

export type AnalysisResult = {
  complaint: Complaint;
  rootCause: RootCauseRecord;
  recommendation: RecommendationRecord;
  action: ActionRecord;
  packaging: PackagingRecord;
};

function addWeeks(iso: string, weeks: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

/**
 * Deterministic rule-based analysis engine. Given a raw complaint it derives every
 * downstream record CCPD stores — no user input beyond the complaint itself.
 */
export function analyzeComplaint(
  input: ComplaintInput,
  meta: { complaintId: string; userId: string },
): AnalysisResult {
  const rule = ruleFor(input.category);
  const createdAt = new Date().toISOString();
  const date = input.date || createdAt.slice(0, 10);
  const profile = packagingProfiles[rule.packaging] ?? packagingProfiles["Paper Box"]!;

  const complaint: Complaint = {
    complaintId: meta.complaintId,
    userId: meta.userId,
    customer: input.customer,
    text: input.text,
    category: input.category,
    branch: input.branch,
    product: input.product ?? "",
    source: input.source,
    priority: input.priority ?? rule.severity,
    status: input.status ?? "Open",
    date,
    department: rule.department,
    createdAt,
  };

  return {
    complaint,
    rootCause: {
      complaintId: meta.complaintId,
      userId: meta.userId,
      category: input.category,
      rootCause: rule.rootCause,
      description: rule.rootCauseDescription,
      confidence: rule.confidence,
      severity: rule.severity,
      status: "Pending",
      createdAt,
    },
    recommendation: {
      complaintId: meta.complaintId,
      userId: meta.userId,
      problem: rule.problem,
      recommendation: rule.recommendation,
      priority: rule.severity,
      impact: rule.impact,
      timeline: rule.timeline,
      steps: rule.steps,
      businessImpact: rule.businessImpact,
      department: rule.department,
      category: input.category,
      status: "Pending",
      createdAt,
    },
    action: {
      complaintId: meta.complaintId,
      userId: meta.userId,
      recommendation: rule.recommendation,
      action: rule.action,
      department: rule.department,
      category: input.category,
      status: "Pending",
      expectedCompletion: addWeeks(date, rule.weeksToImplement),
      implementationDate: null,
      progress: 0,
      impact: rule.impact,
      createdAt,
    },
    packaging: {
      complaintId: meta.complaintId,
      userId: meta.userId,
      category: input.category,
      packagingType: profile.name,
      summary: profile.summary,
      useCases: profile.useCases,
      metrics: profile.metrics,
      createdAt,
    },
  };
}
