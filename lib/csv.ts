type Cell = string | number | null | undefined;

// A cell starting with one of these is run as a formula by Excel and Sheets.
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(value: Cell) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (typeof value === "string" && FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** RFC 4180 CSV, with CRLF line endings and a BOM so Excel reads it as UTF-8. */
export function toCsv(header: string[], rows: Cell[][]) {
  const lines = [header, ...rows].map((row) => row.map(escapeCell).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
