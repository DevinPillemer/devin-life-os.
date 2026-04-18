export const FALLBACK_SHEET_ID = "1PRwlbD23jpdn5W6PbE6flvwcQLGpk_HmWagCEruJIeE";

export interface SheetBudgetSnapshot {
  monthLabel: string;
  billingPeriod: string;
  openingBalance: number;
  liveBankBalanceActual: number;
  endBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalCharities: number;
  totalTransfers: number;
  totalInvestments: number;
  totalLoans: number;
  totalContributions: number;
  ccExpenses: Array<{ label: string; value: number }>;
  sections: Array<{ label: string; value: number }>;
}

const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function toNumber(value?: string) {
  if (!value) return 0;
  const cleaned = value.replace(/₪|,/g, "").trim();
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function findMonthColumn(rows: string[][]) {
  const header = rows[1] || [];
  let idx = -1;
  for (let i = header.length - 1; i >= 1; i--) {
    if ((header[i] || "").trim()) {
      idx = i;
      break;
    }
  }
  return idx === -1 ? 1 : idx;
}

function getRowValue(rowMap: Map<string, string[]>, monthCol: number, ...labels: string[]) {
  for (const label of labels) {
    const row = rowMap.get(norm(label));
    if (row) return toNumber(row[monthCol]);
  }
  return 0;
}

export function parseBudgetSheet(rows: string[][]): SheetBudgetSnapshot {
  const monthCol = findMonthColumn(rows);
  const rowMap = new Map<string, string[]>();

  for (const row of rows) {
    const label = (row[0] || "").trim();
    if (!label) continue;
    rowMap.set(norm(label), row);
  }

  const ccLabels = [
    "Gyms & Fitness",
    "Food Shopping (Personal)",
    "Eating Out & Delivery",
    "Self Spend & Personal Items",
    "Transportation (Parking/Train/Taxi)",
    "Medical / Health",
    "Travel / Events",
    "SaaS & AI Tools (Tech Subs)",
    "Miscellaneous / Other",
    "Bike & E-Scooter Mobility",
    "Alcohol & Entertainment",
    "Personal Care & Beauty",
  ];

  const snapshot: SheetBudgetSnapshot = {
    monthLabel: rows[1]?.[monthCol] || "",
    billingPeriod: rows[2]?.[monthCol] || "",
    openingBalance: getRowValue(rowMap, monthCol, "Opening Balance"),
    liveBankBalanceActual: getRowValue(rowMap, monthCol, "Live Bank Balance (Actual)", "Live Bank Balance Actual"),
    endBalance: getRowValue(rowMap, monthCol, "End Balance"),
    totalIncome: getRowValue(rowMap, monthCol, "TOTAL INCOME", "Total Income"),
    totalExpenses: getRowValue(rowMap, monthCol, "TOTAL EXPENSES", "Total CC Expenses"),
    totalCharities: getRowValue(rowMap, monthCol, "TOTAL CHARITIES", "Total Charities"),
    totalTransfers: getRowValue(rowMap, monthCol, "TOTAL TRANSFERS", "Total Transfers"),
    totalInvestments: getRowValue(rowMap, monthCol, "TOTAL INVESTMENTS"),
    totalLoans: getRowValue(rowMap, monthCol, "TOTAL LOANS", "Total Loans"),
    totalContributions: getRowValue(rowMap, monthCol, "TOTAL CONTRIBUTIONS"),
    ccExpenses: ccLabels.map((label) => ({ label, value: getRowValue(rowMap, monthCol, label) })),
    sections: [],
  };

  snapshot.sections = Array.from(rowMap.entries())
    .map(([key, row]) => ({ key, label: row[0] || "", value: toNumber(row[monthCol]) }))
    .filter((r) => r.value !== 0 && !r.key.includes("apr") && !r.key.includes("may"))
    .map(({ label, value }) => ({ label, value }));

  return snapshot;
}
