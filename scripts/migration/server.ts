// Bundled against the sanitized source copy, never the live Replit app.
import express from "express";
import { timingSafeEqual } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "../../artifacts/api-server/src/app";
import { logger } from "../../artifacts/api-server/src/lib/logger";

const root = path.dirname(fileURLToPath(import.meta.url));
const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 16 || password.startsWith("REEMPLAZAR")) {
  throw new Error("Configura ADMIN_PASSWORD con una contraseña nueva de al menos 16 caracteres.");
}
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT debe ser un puerto válido.");
}
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.get("/api/admin/check", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const auth = req.headers.authorization || "";
  const supplied = Buffer.from(auth.startsWith("Bearer ") ? auth.slice(7) : "");
  const expected = Buffer.from(password);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  res.sendStatus(204);
});
// Unknown API routes must never return the SPA's HTML.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta API no encontrada" });
});
app.get(/^\/landing-page(?:\/.*)?$/, (req, res) => {
  res.redirect(308, (req.originalUrl.replace(/^\/landing-page/, "") || "/"));
});
app.use("/day-planner", express.static(path.join(root, "public/day-planner")));
app.get(/^\/day-planner(?:\/.*)?$/, (_req, res) => {
  res.sendFile(path.join(root, "public/day-planner/index.html"));
});
app.use(express.static(path.join(root, "public")));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(root, "public/index.html"));
});
const server = app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Global Flow iniciado");
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
