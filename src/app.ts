import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import db from "./db/db";
import { swaggerSpec } from "./docs/swagger";
import routes from "./routes";

const app = express();
const configuredOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isLocalOrigin = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        configuredOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" && isLocalOrigin(origin))
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(
  "/uploads",
  express.static(path.resolve(process.env.UPLOADS_DIR || "uploads")),
);

app.get("/", (_req, res) => {
  res.send("EXITO. Servidor Express con TypeScript y MySQL2 funcionando!");
});
app.get("/health/live", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/health/ready", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    return res.status(200).json({ status: "ready" });
  } catch {
    return res.status(503).json({ status: "not_ready" });
  }
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (_req, res) =>
  res.type("application/json").json(swaggerSpec),
);
app.use("/api", routes);

export default app;
