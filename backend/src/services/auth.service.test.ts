import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { SignOptions } from "jsonwebtoken";
import { z } from "zod";

type UserDoc = { _id: string; email: string; password: string; name: string };

const mockHash = jest.fn<Promise<string>, [string, number]>();
const mockCompare = jest.fn<Promise<boolean>, [string, string]>();
const mockSign = jest.fn<string, [object, string, SignOptions]>();
const mockFindOne = jest.fn<Promise<UserDoc | null>, [unknown?]>();
const mockSave = jest.fn<Promise<void>, []>();

let AuthService: typeof import("./auth.service.js").AuthService;

beforeAll(async () => {
  await jest.unstable_mockModule("bcryptjs", () => ({
    hash: (...args: Parameters<typeof import("bcryptjs").hash>) => mockHash(...args),
    compare: (...args: Parameters<typeof import("bcryptjs").compare>) => mockCompare(...args),
  }));

  await jest.unstable_mockModule("jsonwebtoken", () => ({
    default: {
      sign: (...args: Parameters<typeof import("jsonwebtoken").sign>) => mockSign(...args),
    },
  }));

  await jest.unstable_mockModule("../models/user.model.js", () => {
    const UserSchema = z.object({
      email: z.string().email("Email invalide"),
      password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
      name: z.string().min(1, "Le nom est requis"),
    });
    function MockUser(
      this: { save: typeof mockSave; email: string; password: string; name: string },
      data: { email: string; password: string; name: string }
    ) {
      this.email = data.email;
      this.password = data.password;
      this.name = data.name;
      this.save = mockSave;
    }
    (MockUser as unknown as { findOne: typeof mockFindOne }).findOne = mockFindOne;
    return {
      UserSchema,
      User: MockUser,
    };
  });

  ({ AuthService } = await import("./auth.service.js"));
});

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "secret-test";
    mockHash.mockResolvedValue("hashed-password");
    mockCompare.mockResolvedValue(true);
    mockSign.mockReturnValue("jwt-token");
    mockSave.mockResolvedValue(undefined);
  });

  describe("register", () => {
    it("valide les données, hash le mot de passe et enregistre l'utilisateur", async () => {
      await AuthService.register({
        email: "u@test.com",
        password: "secret12",
        name: "User",
      });

      expect(mockHash).toHaveBeenCalledWith("secret12", 10);
      expect(mockSave).toHaveBeenCalled();
    });

    it("rejette les données invalides (Zod)", async () => {
      await expect(
        AuthService.register({
          email: "invalid",
          password: "12345",
          name: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("lève une erreur si l'utilisateur n'existe pas", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(AuthService.login({ email: "x@y.com", password: "secret12" })).rejects.toThrow(
        "Utilisateur non trouvé"
      );
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it("lève une erreur si le mot de passe est incorrect", async () => {
      mockFindOne.mockResolvedValue({
        _id: "id1",
        email: "u@test.com",
        password: "stored-hash",
        name: "User",
      });
      mockCompare.mockResolvedValue(false);

      await expect(AuthService.login({ email: "u@test.com", password: "wrong" })).rejects.toThrow(
        "Mot de passe incorrect"
      );
    });

    it("retourne un token JWT si les identifiants sont valides", async () => {
      mockFindOne.mockResolvedValue({
        _id: "id1",
        email: "u@test.com",
        password: "stored-hash",
        name: "User",
      });
      mockCompare.mockResolvedValue(true);

      const result = await AuthService.login({ email: "u@test.com", password: "okpassword" });

      expect(mockCompare).toHaveBeenCalledWith("okpassword", "stored-hash");
      expect(mockSign).toHaveBeenCalledWith(
        { id: "id1", email: "u@test.com", name: "User" },
        "secret-test",
        { expiresIn: "1h" }
      );
      expect(result).toEqual({ token: "jwt-token" });
    });
  });
});
