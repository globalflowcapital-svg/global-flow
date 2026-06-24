import { Router, type IRouter } from "express";
import { db, leadsTable, insertLeadSchema } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/leads", async (req, res) => {
  const parsed = insertLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const [row] = await db.insert(leadsTable).values(parsed.data).returning({ id: leadsTable.id });
    logger.info({ id: row?.id }, "Lead guardado");
    res.status(201).json({ success: true, id: row?.id });
  } catch (err) {
    logger.error({ err }, "Error al guardar lead");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/leads", async (req, res) => {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "globalflow2024";
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  try {
    const rows = await db.select().from(leadsTable).orderBy(leadsTable.createdAt);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Error al obtener leads");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
