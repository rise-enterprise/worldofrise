import { HEADER_TO_DB_MAP, BOOLEAN_FIELDS, NUMBER_FIELDS, DATE_FIELDS, DATETIME_FIELDS } from "./contactColumns";

// Normalize a phone number: strip spaces, dashes, parentheses
export function normalizePhone(val: string): string {
  if (!val) return "";
  return val.replace(/[\s\-()\.]/g, "").trim();
}

// Parse boolean from various formats
export function parseBoolean(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  const s = String(val ?? "").toLowerCase().trim();
  return ["true", "1", "yes", "y"].includes(s);
}

// Parse a numeric value safely
export function parseNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const s = String(val).replace(/[,]/g, "").trim();
  const n = Number(s);
  return isNaN(n) ? null : n;
}

// Parse date with multi-format support
export function parseDate(val: unknown): string | null {
  if (!val || String(val).trim() === "") return null;
  const s = String(val).trim();

  // Try ISO first
  let d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];

  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = s.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    // If first part > 12, assume DD/MM/YYYY
    if (Number(a) > 12) {
      d = new Date(`${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }
    // Try MM/DD/YYYY
    d = new Date(`${c}-${a.padStart(2, "0")}-${b.padStart(2, "0")}`);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  }

  return null;
}

export function parseDatetime(val: unknown): string | null {
  if (!val || String(val).trim() === "") return null;
  const s = String(val).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString();

  // Fallback: try parsing as date only
  const dateOnly = parseDate(val);
  if (dateOnly) return new Date(dateOnly).toISOString();
  return null;
}

// Auto-map file headers to db fields
export function autoMapHeaders(fileHeaders: string[]): { mapping: Record<string, string>; unmapped: string[] } {
  const mapping: Record<string, string> = {};
  const unmapped: string[] = [];

  for (const fh of fileHeaders) {
    const key = fh.toLowerCase().trim();
    if (HEADER_TO_DB_MAP[key]) {
      mapping[fh] = HEADER_TO_DB_MAP[key];
    } else {
      unmapped.push(fh);
    }
  }

  return { mapping, unmapped };
}

// Normalize a single row using the column mapping
export function normalizeRow(raw: Record<string, unknown>, mapping: Record<string, string>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  for (const [fileCol, dbCol] of Object.entries(mapping)) {
    let val = raw[fileCol];

    if (BOOLEAN_FIELDS.includes(dbCol)) {
      row[dbCol] = parseBoolean(val);
    } else if (NUMBER_FIELDS.includes(dbCol)) {
      row[dbCol] = parseNumber(val);
    } else if (DATE_FIELDS.includes(dbCol)) {
      row[dbCol] = parseDate(val);
    } else if (DATETIME_FIELDS.includes(dbCol)) {
      row[dbCol] = parseDatetime(val);
    } else if (dbCol === "email" || dbCol === "alt_email") {
      row[dbCol] = val ? String(val).toLowerCase().trim() : null;
    } else if (dbCol === "phone" || dbCol === "work_phone") {
      row[dbCol] = val ? normalizePhone(String(val)) : null;
    } else {
      row[dbCol] = val != null ? String(val).trim() : null;
    }
  }

  return row;
}

// Deduplicate rows: loyalty_id > email > phone, keep most recent (last_visit then created_date)
export function deduplicateRows(rows: Record<string, unknown>[]): { unique: Record<string, unknown>[]; dupCount: number } {
  const seen = new Map<string, { index: number; row: Record<string, unknown> }>();

  function getKey(row: Record<string, unknown>): string | null {
    if (row.loyalty_id && String(row.loyalty_id).trim()) return `lid:${String(row.loyalty_id).trim()}`;
    if (row.email && String(row.email).trim()) return `email:${String(row.email).trim()}`;
    if (row.phone && String(row.phone).trim()) return `phone:${String(row.phone).trim()}`;
    return null;
  }

  function getRecency(row: Record<string, unknown>): number {
    const lv = row.last_visit ? new Date(String(row.last_visit)).getTime() : 0;
    if (lv > 0) return lv;
    const cd = row.created_date ? new Date(String(row.created_date)).getTime() : 0;
    return cd;
  }

  let dupCount = 0;

  rows.forEach((row, index) => {
    const key = getKey(row);
    if (!key) {
      // No dedup key, treat as unique with a unique key
      seen.set(`__nokey_${index}`, { index, row });
      return;
    }

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, { index, row });
    } else {
      dupCount++;
      if (getRecency(row) > getRecency(existing.row)) {
        seen.set(key, { index, row });
      }
    }
  });

  return { unique: Array.from(seen.values()).map((v) => v.row), dupCount };
}

// Export contacts to CSV
export function exportToCSV(contacts: Record<string, unknown>[], columns: { header: string; dbField: string }[]): string {
  const headers = columns.map((c) => `"${c.header}"`).join(",");
  const rows = contacts.map((contact) => {
    return columns
      .map((col) => {
        const val = contact[col.dbField];
        if (val === null || val === undefined) return "";
        const s = String(val);
        return `"${s.replace(/"/g, '""')}"`;
      })
      .join(",");
  });
  return [headers, ...rows].join("\n");
}
