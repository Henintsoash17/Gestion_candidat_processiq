import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  static async register(req: Request, res: Response) {
    console.log("Register controller called");
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      console.log("Error in register:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else if (error.code === 11000) {
        res.status(409).json({ message: "Email déjà utilisé" });
      } else {
        res.status(500).json({ message: "Erreur interne du serveur" });
      }
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error: any) {
      if (
        error.message === "Utilisateur non trouvé" ||
        error.message === "Mot de passe incorrect"
      ) {
        res.status(401).json({ message: "Identifiants invalides" });
      } else {
        res.status(500).json({ message: "Erreur interne du serveur" });
      }
    }
  }
}
