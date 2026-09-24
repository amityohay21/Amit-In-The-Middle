import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import searchRoutes from "./routes/search.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "meetmid" });
  });

  app.use("/api", searchRoutes);
  app.use(errorHandler);

  return app;
}
