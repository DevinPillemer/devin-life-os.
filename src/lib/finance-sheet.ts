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

export interface ParsedBudgetSheet {
  snapshot: SheetBudgetSnapshot;
  debug: {
    requestedMonth: string;
    selectedMonthLabel: string;
    monthColumn: number;
    availableMonths: Array<{ label: string; columnIndex: number }>;
    foundLabels: string[];
    missedLabels: string[];
    labelRowIndexes: Record<string, number>;
  };
}

const REQUIRED_LABELS = [
  "TOTAL EXPENSES",
  "TOTAL INCOME",
  "TOTAL CHARITIES",
  "TOTAL TRANSFERS",
  "TOTAL LOANS",
  "TOTAL INVESTMENTS",
  "Opening Balance",
  "Live Bank Balance (Actual)",
  "End Balance",
  "Net",
] as const;

const norm = (value: string) => value.toLowerCase().trim();

function toNumber(value?: string) {
  if (!value) return 0;
  const cleaned = value.replace(/₪|,/g, "").trim();
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function resolveMonthColumn(rows: string[][], requestedMonth?: string) {
  const header = rows[1] || [];
  const availableMonths: Array<{ label: string; columnIndex: number }> = [];

  for (let i = 1; i < header.length; i++) {
    const label = (header[i] || "").trim();
    if (label) {
      availableMonths.push({ label, columnIndex: i });
    }
  }

  if (!availableMonths.length) {
    throw new Error("Month header row is empty (expected month names in row 2)");
  }

  const requested = (requestedMonth || "").trim();
  if (requested) {
    const found = availableMonths.find((month) => norm(month.label) === norm(requested));
    if (!found) {
      throw new Error(`Requested month '${requested}' was not found in row 2 headers`);
    }
    return {
      requestedMonth: requested,
      selectedMonthLabel: found.label,
      monthColumn: found.columnIndex,
      availableMonths,
    };
  }

  const selected = availableMonths[availableMonths.length - 1];
  return {
    requestedMonth: selected.label,
    selectedMonthLabel: selected.label,
    monthColumn: selected.columnIndex,
    availableMonths,
  };
}

function getRowValue(rowMap: Map<string, string[]>, monthCol: number, ...labels: string[]) {
  for (const label of labels) {
    const row = rowMap.get(norm(label));
    if (row) return toNumber(row[monthCol]);
  }
  return 0;
}

export function parseBudgetSheet(rows: string[][], requestedMonth?: string): ParsedBudgetSheet {
  if (!rows.length) {
    throw new Error("No rows returned from Google Sheets");
  }

  const monthInfo = resolveMonthColumn(rows, requestedMonth);
  const rowMap = new Map<string, string[]>();
  const labelRowIndexes: Record<string, number> = {};

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const label = (row[0] || "").trim();
    if (!label) continue;
    const normalized = norm(label);
    rowMap.set(normalized, row);
    labelRowIndexes[normalized] = rowIndex + 1;
  }

  const foundLabels: string[] = [];
  const missedLabels: string[] = [];
  for (const label of REQUIRED_LABELS) {
    if (rowMap.has(norm(label))) {
      foundLabels.push(label);
    } else {
      missedLabels.push(label);
    }
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
    monthLabel: monthInfo.selectedMonthLabel,
    billingPeriod: rows[2]?.[monthInfo.monthColumn] || "",
    openingBalance: getRowValue(rowMap, monthInfo.monthColumn, "Opening Balance"),
    liveBankBalanceActual: getRowValue(rowMap, monthInfo.monthColumn, "Live Bank Balance (Actual)", "Live Bank Balance Actual"),
    endBalance: getRowValue(rowMap, monthInfo.monthColumn, "End Balance"),
    totalIncome: getRowValue(rowMap, monthInfo.monthColumn, "TOTAL INCOME", "Total Income"),
    totalExpenses: getRowValue(rowMap, monthInfo.monthColumn, "TOTAL EXPENSES", "Total CC Expenses"),
    totalCharities: getRowValue(rowMap, monthInfo.monthColumn, "TOTAL CHARITIES", "Total Charities"),
    totalTransfers: getRowValue(rowMap, monthInfo.monthColumn, "TOTAL TRANSFERS", "Total Transfers"),
    totalInvestments: getRowValue(rowMap, monthInfo.monthColumn, "TOTAL INVESTMENTS"),
    totalLoans: getRowValue(rowMap, monthInfo.monthColumn, "TOTAL LOANS", "Total Loans"),
    totalContributions: getRowValue(rowMap, monthInfo.monthColumn, "TOTAL CONTRIBUTIONS"),
    ccExpenses: ccLabels.map((label) => ({ label, value: getRowValue(rowMap, monthInfo.monthColumn, label) })),
    sections: [],
  };

  snapshot.sections = Array.from(rowMap.values())
    .map((row) => ({ label: row[0] || "", value: toNumber(row[monthInfo.monthColumn]) }))
    .filter((row) => row.value !== 0);

  return {
    snapshot,
    debug: {
      requestedMonth: monthInfo.requestedMonth,
      selectedMonthLabel: monthInfo.selectedMonthLabel,
      monthColumn: monthInfo.monthColumn,
      availableMonths: monthInfo.availableMonths,
      foundLabels,
      missedLabels,
      labelRowIndexes,
    },
  };
}
