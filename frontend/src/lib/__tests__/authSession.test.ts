import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import {
  applyLoginToken,
  clearStoredAuth,
  coerceUserId,
  readInitialUserFromStorage,
  userFromTokenPayload,
} from "../authSession";
import { makeTestJwt } from "./testJwt";

describe("coerceUserId", () => {
  it("accepte id string ou number", () => {
    expect(coerceUserId({ id: "abc" })).toBe("abc");
    expect(coerceUserId({ id: 42 })).toBe("42");
  });

  it("accepte _id et sub", () => {
    expect(coerceUserId({ _id: "x" })).toBe("x");
    expect(coerceUserId({ sub: "y" })).toBe("y");
  });

  it("accepte $oid Mongo", () => {
    expect(coerceUserId({ id: { $oid: "507f1f77bcf86cd799439011" } })).toBe(
      "507f1f77bcf86cd799439011"
    );
  });

  it("refuse $oid non string", () => {
    expect(coerceUserId({ id: { $oid: 123 } })).toBeNull();
  });

  it("retourne null si aucun identifiant valide", () => {
    expect(coerceUserId({})).toBeNull();
    expect(coerceUserId({ id: { foo: 1 } })).toBeNull();
    expect(coerceUserId({ id: { $oid: 1 } })).toBeNull();
  });
});

describe("userFromTokenPayload", () => {
  it("construit un utilisateur valide", () => {
    expect(
      userFromTokenPayload({
        id: "1",
        email: "a@b.com",
        name: "N",
      })
    ).toEqual({ id: "1", email: "a@b.com", name: "N" });
  });

  it("name optionnel devient chaîne vide", () => {
    expect(
      userFromTokenPayload({
        id: "1",
        email: "a@b.com",
      })
    ).toEqual({ id: "1", email: "a@b.com", name: "" });
  });

  it("retourne null si email invalide ou id manquant", () => {
    expect(userFromTokenPayload({ id: "1", email: 2 })).toBeNull();
    expect(userFromTokenPayload({ email: "a@b.com" })).toBeNull();
  });
});

describe("clearStoredAuth", () => {
  it("supprime token et user", () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("user", "{}");
    clearStoredAuth();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("readInitialUserFromStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("retourne null et nettoie si token expiré", () => {
    const past = Math.floor(Date.now() / 1000) - 500;
    const token = makeTestJwt({
      id: "1",
      email: "a@b.com",
      name: "n",
      exp: past,
    });
    localStorage.setItem("token", token);
    expect(readInitialUserFromStorage()).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("retourne null si payload illisible", () => {
    localStorage.setItem("token", "a.b.c");
    expect(readInitialUserFromStorage()).toBeNull();
  });

  it("retourne null si utilisateur invalide", () => {
    const token = makeTestJwt({ email: "a@b.com" });
    localStorage.setItem("token", token);
    expect(readInitialUserFromStorage()).toBeNull();
  });

  it("persiste user et retourne l’utilisateur si token valide", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeTestJwt({
      id: "1",
      email: "a@b.com",
      name: "Test",
      exp,
    });
    localStorage.setItem("token", token);
    const user = readInitialUserFromStorage();
    expect(user).toEqual({ id: "1", email: "a@b.com", name: "Test" });
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual(user);
  });
});

describe("applyLoginToken", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("retourne null et nettoie si token vide", () => {
    localStorage.setItem("token", "old");
    expect(applyLoginToken("  ")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("retourne null si payload invalide", () => {
    expect(applyLoginToken("x.y.z")).toBeNull();
  });

  it("retourne null si utilisateur invalide", () => {
    const token = makeTestJwt({ foo: 1 });
    expect(applyLoginToken(token)).toBeNull();
  });

  it("enregistre token et user", () => {
    const token = makeTestJwt({ id: "9", email: "z@z.com", name: "Z" });
    const user = applyLoginToken(token);
    expect(user).toEqual({ id: "9", email: "z@z.com", name: "Z" });
    expect(localStorage.getItem("token")).toBe(token);
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual(user);
  });
});
