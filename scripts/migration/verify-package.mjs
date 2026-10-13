import { access } from "node:fs/promises";
for (const file of ["server.mjs", "public/index.html", "public/day-planner/index.html", "database/schema.sql"]) {
  await access(new URL(`../${file}`, import.meta.url));
}
console.log("Paquete listo: servidor, sitios y esquema encontrados.");
