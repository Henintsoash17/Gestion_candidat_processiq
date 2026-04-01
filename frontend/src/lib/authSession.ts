import { isJwtExpiredOrInvalid, parseJwtPayload } from "@/lib/jwt";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export function clearStoredAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function coerceUserId(payload: Record<string, unknown>): string | null {
  const raw = payload.id ?? payload._id ?? payload.sub;
  if (raw == null) return null;
  if (typeof raw === "string" || typeof raw === "number") return String(raw);
  if (typeof raw === "object" && raw !== null && "$oid" in raw) {
    const oid = (raw as { $oid?: unknown }).$oid;
    if (typeof oid === "string") return oid;
  }
  return null;
}

export function userFromTokenPayload(payload: Record<string, unknown>): AuthUser | null {
  const id = coerceUserId(payload);
  const email = payload.email;
  const name = payload.name;
  if (!id) return null;
  if (typeof email !== "string") return null;
  const nameStr = typeof name === "string" ? name : "";
  return { id, email, name: nameStr };
}

export function readInitialUserFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (isJwtExpiredOrInvalid(token)) {
    clearStoredAuth();
    return null;
  }

  const payload = parseJwtPayload(token!);
  const nextUser = userFromTokenPayload(payload!);
  if (!nextUser) {
    clearStoredAuth();
    return null;
  }

  localStorage.setItem("user", JSON.stringify(nextUser));
  return nextUser;
}

export function applyLoginToken(token: string): AuthUser | null {
  if (!token?.trim()) {
    clearStoredAuth();
    return null;
  }
  const payload = parseJwtPayload(token);
  const nextUser = payload ? userFromTokenPayload(payload) : null;
  if (!nextUser) {
    clearStoredAuth();
    return null;
  }
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(nextUser));
  return nextUser;
}
