import { Request, Response } from "express";
import { CandidateService } from "../services/candidate.service.js";
import { CandidateSchema } from "../validators/candidate.schema.js";

export class CandidateController {
  static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await CandidateService.getAll(page, limit, { status, search });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const validatedData = CandidateSchema.parse(req.body);
      const candidate = await CandidateService.create(validatedData);
      res.status(201).json(candidate);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const candidate = await CandidateService.findById(req.params.id);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const validatedData = CandidateSchema.parse(req.body);
      const candidate = await CandidateService.update(req.params.id, validatedData);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });
      res.json(candidate);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const candidate = await CandidateService.softDelete(req.params.id);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async validate(req: Request, res: Response) {
    try {
      const candidate = await CandidateService.validate(req.params.id);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async reject(req: Request, res: Response) {
    try {
      const candidate = await CandidateService.reject(req.params.id);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
