import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, CandidateController.getAll);

router.post("/", authMiddleware, CandidateController.create);

router.get("/:id", authMiddleware, CandidateController.get);

router.put("/:id", authMiddleware, CandidateController.update);

router.delete("/:id", authMiddleware, CandidateController.delete);

router.post("/:id/validate", authMiddleware, CandidateController.validate);

router.post("/:id/reject", authMiddleware, CandidateController.reject);

export default router;
