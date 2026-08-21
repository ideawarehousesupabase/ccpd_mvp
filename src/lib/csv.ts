import type { ComplaintInput, ComplaintStatus, Priority } from "./ccpd-types";
import { complaintCategories } from "@/data/complaint-form";

function splitLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

const ALIASES: Record<string, string> = {
  "customer name": "customer",
  customer: "customer",
  "complaint description": "text",
  description: "text",
  complaint: "text",
  category: "category",
  "branch / location": "branch",
  branch: "branch",
  location: "branch",
  "product / service": "product",
  product: "product",
  "complaint date": "date",
  date: "date",
  priority: "priority",
  status: "status",
};

export type CsvParseResult = { rows: ComplaintInput[]; errors: string[] };

/** Parses a CCPD complaint CSV into validated complaint inputs. */
export function parseComplaintCsv(text: string): CsvParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const errors: string[] = [];
  if (lines.length < 2) return { rows: [], errors: ["The CSV file has no data rows."] };

  const header = splitLine(lines[0]!).map((h) => ALIASES[h.toLowerCase()] ?? h.toLowerCase());
  const required = ["customer", "text", "category", "branch"];
  const missingCols = required.filter((r) => !header.includes(r));
  if (missingCols.length) {
    return { rows: [], errors: [`Missing required columns: ${missingCols.join(", ")}`] };
  }

  const rows: ComplaintInput[] = [];
  lines.slice(1).forEach((line, i) => {
    const cells = splitLine(line);
    const get = (k: string) => cells[header.indexOf(k)]?.replace(/^"|"$/g, "").trim() ?? "";
    const customer = get("customer");
    const body = get("text");
    const rawCategory = get("category");
    const branch = get("branch");
    if (!customer || !body || !rawCategory || !branch) {
      errors.push(`Row ${i + 2}: missing a required value.`);
      return;
    }
    const category =
      complaintCategories.find((c) => c.toLowerCase() === rawCategory.toLowerCase()) ?? "Others";
    const priority = ["High", "Medium", "Low"].find(
      (p) => p.toLowerCase() === get("priority").toLowerCase(),
    ) as Priority | undefined;
    const status = ["Open", "In Review", "Resolved"].find(
      (s) => s.toLowerCase() === get("status").toLowerCase(),
    ) as ComplaintStatus | undefined;

    rows.push({
      customer,
      text: body,
      category,
      branch,
      product: get("product"),
      source: "CSV Upload",
      ...(get("date") ? { date: get("date") } : {}),
      ...(priority ? { priority } : {}),
      ...(status ? { status } : {}),
    });
  });

  return { rows, errors };
}

export const CSV_TEMPLATE = [
  "Customer Name,Complaint Description,Category,Branch / Location,Product / Service,Complaint Date,Priority,Status",
  '"Amara Yusuf","Meal arrived cold and the rice was hard","Food Temperature","Lekki Branch","Jollof Combo","2026-01-14","High","Open"',
  '"Daniel Okon","Soup leaked all over the bag","Packaging Leakage","Yaba Branch","Pepper Soup","2026-01-15","High","Open"',
].join("\n");

/** Triggers a browser download of a CSV built from headers + rows. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
