import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  pais: text("pais").notNull(),
  codigoPais: text("codigo_pais").notNull(),
  whatsapp: text("whatsapp").notNull(),
  operadoCriptos: boolean("operado_criptos").notNull(),
  nivel: text("nivel").notNull(),
  fuente: text("fuente"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leadsTable)
  .omit({ id: true, createdAt: true })
  .partial({ fuente: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
