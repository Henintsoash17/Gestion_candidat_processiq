import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import candidateRoutes from "./routes/candidate.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";
import logger from "./config/logger.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Middleware de logging pour les requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, { ip: req.ip, userAgent: req.get("User-Agent") });
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);

connectDB();

app.listen(5000, () => {
  console.log("Server running");
});
