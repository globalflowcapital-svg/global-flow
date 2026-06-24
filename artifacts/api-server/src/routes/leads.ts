import { Router, type IRouter } from "express";
import { db, leadsTable, insertLeadSchema } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { logger } from "../lib/logger";
import { z } from "zod/v4";

const router: IRouter = Router();

function adminAuth(req: any, res: any): boolean {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "globalflow2024";
  const auth = (req.headers["authorization"] as string) ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "No autorizado" });
    return false;
  }
  return true;
}

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
  if (!adminAuth(req, res)) return;
  try {
    const rows = await db.select().from(leadsTable).orderBy(leadsTable.createdAt);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Error al obtener leads");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/leads/:id", async (req, res) => {
  if (!adminAuth(req, res)) return;
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  try {
    await db.delete(leadsTable).where(eq(leadsTable.id, id));
    logger.info({ id }, "Lead eliminado");
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Error al eliminar lead");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/leads", async (req, res) => {
  if (!adminAuth(req, res)) return;
  const parsed = z.object({ ids: z.array(z.number()).min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Body inválido. Se esperaba { ids: number[] }" });
    return;
  }
  try {
    await db.delete(leadsTable).where(inArray(leadsTable.id, parsed.data.ids));
    logger.info({ ids: parsed.data.ids }, "Leads eliminados en masa");
    res.json({ success: true, deleted: parsed.data.ids.length });
  } catch (err) {
    logger.error({ err }, "Error al eliminar leads en masa");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
