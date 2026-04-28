/** Build UTF-8 CSV with BOM so Excel recognizes encoding; RFC-style quoting when needed */
export function encodeCsvRows(rows: string[][]): string {
  const escapeCell = (value: string) => {
    if (value.includes('"') || /[,\r\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const body = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
  return `\uFEFF${body}`;
}
