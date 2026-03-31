/**
 * Obfuscates an email for display (e.g. j*******@example.com).
 * Non-email strings are lightly masked when they lack "@".
 */
export function maskEmailForPrivacy(raw: string): string {
  const s = raw.trim();
  if (!s || s === "—") return s;

  const at = s.indexOf("@");
  if (at < 0) {
    if (s.length <= 1) return "*";
    return s[0] + "*".repeat(Math.max(3, s.length - 1));
  }

  const local = s.slice(0, at);
  const domain = s.slice(at + 1);
  if (!local) return `*@${domain}`;

  const first = local[0]!;
  const asterisks = "*".repeat(Math.max(3, local.length - 1));
  return `${first}${asterisks}@${domain}`;
}

export function shouldMaskEmailField(key: string): boolean {
  return key.toLowerCase().includes("email");
}
