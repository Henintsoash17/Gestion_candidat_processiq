import { describe, expect, it } from "@jest/globals";
import { UserSchema } from "./user.model.js";

describe("UserSchema (Zod)", () => {
  it("accepte un objet valide", () => {
    const parsed = UserSchema.parse({
      email: "a@b.com",
      password: "secret1",
      name: "Nom",
    });
    expect(parsed).toEqual({
      email: "a@b.com",
      password: "secret1",
      name: "Nom",
    });
  });

  it("rejette un email invalide", () => {
    expect(() =>
      UserSchema.parse({
        email: "pas-un-email",
        password: "secret1",
        name: "Nom",
      })
    ).toThrow();
  });

  it("rejette un mot de passe trop court", () => {
    expect(() =>
      UserSchema.parse({
        email: "a@b.com",
        password: "12345",
        name: "Nom",
      })
    ).toThrow();
  });

  it("rejette un nom vide", () => {
    expect(() =>
      UserSchema.parse({
        email: "a@b.com",
        password: "secret1",
        name: "",
      })
    ).toThrow();
  });
});
