export type RegistrationRow = Record<string, unknown>;

const NAME_KEYS = [
  "name",
  "full_name",
  "display_name",
  "fullname",
] as const;

const EMAIL_KEYS = [
  "email",
  "email_address",
  "user_email",
  "contact_email",
] as const;

function trimString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

/** Best-effort name from common registration column names. */
export function getDisplayName(row: RegistrationRow): string {
  for (const key of NAME_KEYS) {
    const found = trimString(row[key]);
    if (found) return found;
  }

  const first =
    trimString(row.first_name) ?? trimString(row.firstname) ?? "";
  const last =
    trimString(row.last_name) ?? trimString(row.lastname) ?? "";
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) return combined;

  for (const [key, value] of Object.entries(row)) {
    const k = key.toLowerCase();
    if (k.includes("email") || k === "id") continue;
    if (k.includes("name")) {
      const found = trimString(value);
      if (found) return found;
    }
  }

  return "—";
}

/** Best-effort email from common registration column names. */
export function getDisplayEmail(row: RegistrationRow): string {
  for (const key of EMAIL_KEYS) {
    const found = trimString(row[key]);
    if (found) return found;
  }

  for (const [key, value] of Object.entries(row)) {
    if (key.toLowerCase().includes("email")) {
      const found = trimString(value);
      if (found) return found;
    }
  }

  return "—";
}

export function registrationDetailEntries(
  row: RegistrationRow,
): [string, unknown][] {
  return Object.keys(row)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => [key, row[key]] as [string, unknown]);
}
