import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import { isJwtExpiredOrInvalid, parseJwtPayload } from "../jwt";
import { makeTestJwt } from "./testJwt";

describe("parseJwtPayload", () => {
  it("décode un payload valide", () => {
    const token = makeTestJwt({ sub: "1", email: "a@b.com" });
    expect(parseJwtPayload(token)).toEqual({ sub: "1", email: "a@b.com" });
  });

  it("retourne null si segment payload absent", () => {
    expect(parseJwtPayload("onlyone")).toBeNull();
  });

  it("retourne null si JSON invalide après décodage", () => {
    const bad = btoa("not-json").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(parseJwtPayload(`h.${bad}.s`)).toBeNull();
  });
});

describe("isJwtExpiredOrInvalid", () => {
  const nowSec = Math.floor(Date.now() / 1000);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(nowSec * 1000));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("retourne true si token absent ou vide", () => {
    expect(isJwtExpiredOrInvalid(null)).toBe(true);
    expect(isJwtExpiredOrInvalid("")).toBe(true);
    expect(isJwtExpiredOrInvalid("   ")).toBe(true);
  });

  it("retourne true si parseJwtPayload échoue", () => {
    expect(isJwtExpiredOrInvalid("a.b.c")).toBe(true);
  });

  it("retourne false si pas de claim exp (nombre)", () => {
    const t = makeTestJwt({ id: "1", email: "a@b.com" });
    expect(isJwtExpiredOrInvalid(t)).toBe(false);
  });

  it("retourne false si exp est encore valide avec marge", () => {
    const t = makeTestJwt({ exp: nowSec + 200 });
    expect(isJwtExpiredOrInvalid(t)).toBe(false);
  });

  it("retourne true si exp dépassé au-delà de la marge", () => {
    const t = makeTestJwt({ exp: nowSec - 200 });
    expect(isJwtExpiredOrInvalid(t)).toBe(true);
  });
});
