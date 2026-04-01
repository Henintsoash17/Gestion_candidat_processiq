import { afterEach, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

const mocks = {
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

let CandidateService: typeof import("./candidate.service.js").CandidateService;

beforeAll(async () => {
  await jest.unstable_mockModule("../models/candidate.model.js", () => ({
    Candidate: mocks,
  }));
  ({ CandidateService } = await import("./candidate.service.js"));
});

function makeDoc(overrides: Record<string, unknown> = {}) {
  const base = { name: "Alice", email: "a@b.com", status: "pending", isDeleted: false };
  return {
    _id: { toString: () => "507f1f77bcf86cd799439011" },
    toObject: () => ({ ...base, ...overrides }),
    ...overrides,
  };
}

describe("CandidateService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("retourne la liste paginée avec total", async () => {
      const doc = makeDoc();
      const chain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockImplementation(async () => [doc]),
      };
      mocks.find.mockReturnValue(chain as never);
      mocks.countDocuments.mockResolvedValue(1);

      const result = await CandidateService.getAll();

      expect(mocks.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(10);
      expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mocks.countDocuments).toHaveBeenCalledWith({ isDeleted: false });
      expect(result.total).toBe(1);
      expect(result.candidates[0]).toMatchObject({
        id: "507f1f77bcf86cd799439011",
        name: "Alice",
        email: "a@b.com",
      });
    });

    it("filtre par statut et recherche", async () => {
      const chain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockImplementation(async () => []),
      };
      mocks.find.mockReturnValue(chain as never);
      mocks.countDocuments.mockResolvedValue(0);

      await CandidateService.getAll(2, 5, { status: "validated", search: "bob" });

      expect(mocks.find).toHaveBeenCalledWith({
        isDeleted: false,
        status: "validated",
        $or: [
          { name: { $regex: "bob", $options: "i" } },
          { email: { $regex: "bob", $options: "i" } },
        ],
      });
      expect(chain.skip).toHaveBeenCalledWith(5);
      expect(chain.limit).toHaveBeenCalledWith(5);
    });
  });

  describe("create", () => {
    it("crée un candidat et renvoie id sérialisé", async () => {
      const doc = makeDoc({ name: "New" });
      mocks.create.mockResolvedValue(doc as never);

      const result = await CandidateService.create({
        name: "New",
        email: "n@b.com",
      });

      expect(mocks.create).toHaveBeenCalledWith({
        name: "New",
        email: "n@b.com",
      });
      expect(result).toMatchObject({ id: "507f1f77bcf86cd799439011", name: "New" });
    });
  });

  describe("findById", () => {
    it("retourne null si absent", async () => {
      mocks.findOne.mockResolvedValue(null);

      const result = await CandidateService.findById("507f1f77bcf86cd799439011");

      expect(result).toBeNull();
    });

    it("retourne le candidat mappé", async () => {
      const doc = makeDoc();
      mocks.findOne.mockResolvedValue(doc as never);

      const result = await CandidateService.findById("507f1f77bcf86cd799439011");

      expect(mocks.findOne).toHaveBeenCalledWith({
        _id: "507f1f77bcf86cd799439011",
        isDeleted: false,
      });
      expect(result).toMatchObject({ id: "507f1f77bcf86cd799439011", name: "Alice" });
    });
  });

  describe("update", () => {
    it("retourne null si non trouvé", async () => {
      mocks.findOneAndUpdate.mockResolvedValue(null);

      const result = await CandidateService.update("id", { name: "X" });

      expect(result).toBeNull();
    });

    it("met à jour et renvoie le document", async () => {
      const doc = makeDoc({ name: "Updated" });
      mocks.findOneAndUpdate.mockResolvedValue(doc as never);

      const result = await CandidateService.update("507f1f77bcf86cd799439011", { name: "Updated" });

      expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "507f1f77bcf86cd799439011", isDeleted: false },
        { name: "Updated" },
        { new: true }
      );
      expect(result).toMatchObject({ id: "507f1f77bcf86cd799439011", name: "Updated" });
    });
  });

  describe("softDelete", () => {
    it("retourne null si déjà supprimé ou inconnu", async () => {
      mocks.findOneAndUpdate.mockResolvedValue(null);

      expect(await CandidateService.softDelete("id")).toBeNull();
    });

    it("marque isDeleted à true", async () => {
      const doc = makeDoc({ isDeleted: true });
      mocks.findOneAndUpdate.mockResolvedValue(doc as never);

      const result = await CandidateService.softDelete("507f1f77bcf86cd799439011");

      expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "507f1f77bcf86cd799439011", isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
      expect(result).toMatchObject({ id: "507f1f77bcf86cd799439011" });
    });
  });

  describe("validate", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("retourne null après délai si non trouvé", async () => {
      mocks.findOneAndUpdate.mockResolvedValue(null);

      const p = CandidateService.validate("507f1f77bcf86cd799439011");
      await jest.advanceTimersByTimeAsync(2000);
      const result = await p;

      expect(result).toBeNull();
    });

    it("passe le statut à validated après 2s", async () => {
      const doc = makeDoc({ status: "validated" });
      mocks.findOneAndUpdate.mockResolvedValue(doc as never);

      const p = CandidateService.validate("507f1f77bcf86cd799439011");
      await jest.advanceTimersByTimeAsync(2000);
      const result = await p;

      expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "507f1f77bcf86cd799439011", isDeleted: false },
        { status: "validated" },
        { new: true }
      );
      expect(result).toMatchObject({ status: "validated", id: "507f1f77bcf86cd799439011" });
    });
  });

  describe("reject", () => {
    it("retourne null si non trouvé", async () => {
      mocks.findOneAndUpdate.mockResolvedValue(null);

      expect(await CandidateService.reject("id")).toBeNull();
    });

    it("passe le statut à rejected", async () => {
      const doc = makeDoc({ status: "rejected" });
      mocks.findOneAndUpdate.mockResolvedValue(doc as never);

      const result = await CandidateService.reject("507f1f77bcf86cd799439011");

      expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "507f1f77bcf86cd799439011", isDeleted: false },
        { status: "rejected" },
        { new: true }
      );
      expect(result).toMatchObject({ status: "rejected" });
    });
  });
});
