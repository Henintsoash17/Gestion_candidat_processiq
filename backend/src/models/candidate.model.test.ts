import { describe, expect, it } from "@jest/globals";
import { Candidate } from "./candidate.model.js";

describe("Candidate (modèle Mongoose)", () => {
  it("expose le modèle Candidate", () => {
    expect(Candidate.modelName).toBe("Candidate");
  });

  it("valide un document avec les champs attendus", () => {
    const doc = new Candidate({
      name: "Jane",
      email: "jane@example.com",
      phone: "+261000",
      status: "pending",
      isDeleted: false,
    });
    const err = doc.validateSync();
    expect(err).toBeUndefined();
  });

  it("applique les valeurs par défaut", () => {
    const doc = new Candidate({
      name: "Bob",
      email: "bob@example.com",
    });
    expect(doc.status).toBe("pending");
    expect(doc.isDeleted).toBe(false);
  });
});
