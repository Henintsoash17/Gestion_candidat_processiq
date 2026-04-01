export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Tolérance (secondes) après `exp` pour décalage d’horloge client/serveur. */
const EXP_LEEWAY_SEC = 120;

export function isJwtExpiredOrInvalid(token: string | null): boolean {
  if (!token || !token.trim()) return true;
  const payload = parseJwtPayload(token);
  if (!payload) return true;
  const exp = payload.exp;
  if (typeof exp !== "number") return false;
  const now = Date.now() / 1000;
  return now > exp + EXP_LEEWAY_SEC;
}
