import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const artifacts = path.join(root, "generated-artifacts");
const hostinger = path.join(artifacts, "global-flow-hostinger");
const output = path.join(artifacts, "global-flow-godaddy");
const archive = path.join(artifacts, "global-flow-godaddy.zip");

const generator = spawnSync(process.execPath, ["scripts/migration/package-project.mjs"], {cwd: root, stdio: "inherit"});
if (generator.status !== 0) throw new Error("No se pudo compilar el paquete de migración.");
await fs.rm(output, { recursive: true, force: true });
await fs.cp(hostinger, output, {
  recursive: true,
  filter: (source) => !source.split(path.sep).includes("node_modules"),
});
for (const file of ["LEEME-HOSTINGER.md", "GUIA-HOSTINGER.html"]) {
  await fs.rm(path.join(output, file), { force: true });
}

const pkgPath = path.join(output, "package.json");
const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
pkg.name = "global-flow-godaddy";
pkg.main = "server.mjs";
pkg.engines = { node: ">=22" };
pkg.scripts = {
  build: "node scripts/verify-package.mjs",
  start: "node --env-file-if-exists=.env --import ./production.mjs server.mjs",
};
await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
await fs.copyFile(
  path.join(root, "scripts/migration/production.mjs"),
  path.join(output, "production.mjs"),
);
await fs.copyFile(
  path.join(root, "scripts/migration/verify-package.mjs"),
  path.join(output, "scripts/verify-package.mjs"),
);
await fs.copyFile(
  path.join(root, "scripts/migration/schema.sql"),
  path.join(output, "database/schema.sql"),
);
await fs.copyFile(
  path.join(root, "scripts/migration/GODADDY.md"),
  path.join(output, "LEEME-GODADDY.md"),
);
const lock = spawnSync("npm", [
  "install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund",
], { cwd: output, stdio: "inherit" });
if (lock.status !== 0) throw new Error("No se pudo sincronizar package-lock.json.");
const guide = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Global Flow — GoDaddy Node.js Hosting</title><style>body{font:16px/1.65 system-ui,sans-serif;color:#182430;background:#f3f6f8;margin:0}main{max-width:850px;background:white;margin:32px auto;padding:36px;border:1px solid #ddd;border-radius:12px}h1{font-size:28px}h2{margin-top:34px;border-top:1px solid #ddd;padding-top:20px}a{color:#075ca8;overflow-wrap:anywhere}code{background:#edf1f5;padding:2px 5px;border-radius:4px}pre{background:#edf1f5;padding:16px;overflow:auto}li{margin:8px 0}@media(max-width:600px){main{margin:0;padding:20px;border:0}}@media print{body{background:white}main{border:0;margin:0}pre{white-space:pre-wrap}}</style></head><body><main><h1>GoDaddy Node.js Hosting — Global Flow</h1><p>Resumen de la preparación del paquete, importación ZIP, requisitos y secretos privados.</p><ol><li>Abre GoDaddy Node.js Hosting y crea una aplicación nueva.</li><li>Elige cargar ZIP y selecciona <code>global-flow-godaddy.zip</code>.</li><li>En el asistente, elige añadir los secretos necesarios; también puedes configurarlos en Settings → Secrets.</li><li>Introduce los secretos privados <code>DATABASE_URL</code> (URI PostgreSQL del servidor) y <code>ADMIN_PASSWORD</code> (nueva contraseña, mínimo 16 caracteres). Nunca uses <code>VITE_</code> para secretos.</li><li>Importa la aplicación y prueba primero la vista previa privada: <code>/</code>, <code>/admin</code> y <code>/api/healthz</code>.</li><li>La salud no verifica PostgreSQL. Envía un registro de prueba solo cuando estés listo; el Pixel actual puede registrar una conversión real.</li><li>Tras comprobar, añade tu dominio en Settings y pulsa Publish. Mantén el servidor antiguo hasta verificar el nuevo.</li></ol><h2>PostgreSQL</h2><p>La aplicación necesita PostgreSQL. Añade el esquema incluido <code>database/schema.sql</code> a una base nueva. Supabase es un proveedor compatible opcional; utiliza su URI PostgreSQL server-side, no la clave anon. La URI es privada y va únicamente en el secreto <code>DATABASE_URL</code>. Mantén los contactos antiguos separados: este ZIP no lleva datos personales.</p><p>GoDaddy Node.js Hosting está en beta; revisa sus normas y retención de previews antes de publicar. El paquete está por debajo del límite oficial de 100 MB y no contiene <code>node_modules</code> ni la contraseña fija antigua.</p><h2>Documentación oficial</h2><ul><li><a href="https://www.godaddy.com/help/upload-my-ai-generated-app-to-godaddy-nodejs-hosting-42987">Cómo cargar un ZIP</a></li><li><a href="https://www.godaddy.com/help/godaddy-nodejs-hosting-faq-42915">Requisitos, previews y preguntas frecuentes</a></li><li><a href="https://www.godaddy.com/help/deploy-my-cursor-or-claude-app-with-godaddy-nodejs-hosting-42908">Importar y publicar</a></li><li><a href="https://supabase.com/docs/guides/database/connecting-to-postgres">Conexiones PostgreSQL de Supabase</a></li></ul></main></body></html>`;
await fs.writeFile(path.join(artifacts, "guia-godaddy-global-flow.html"), guide);
await fs.writeFile(path.join(output, "GUIA-GODADDY.html"), guide);
await fs.rm(archive, { force: true });
const zip = spawnSync("python3", ["-c", [
  "from pathlib import Path",
  "import zipfile,sys",
  "source=Path(sys.argv[1]); target=Path(sys.argv[2])",
  "with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:",
  " for item in sorted(source.rglob('*')):",
  "  if item.is_file() and 'node_modules' not in item.relative_to(source).parts:",
  "   if item.is_symlink(): raise RuntimeError('Unexpected symlink')",
  "   z.write(item,item.relative_to(source).as_posix())",
  "with zipfile.ZipFile(target) as z:",
  " assert z.testzip() is None",
  " assert len(z.namelist())>0 and 'package.json' in z.namelist() and 'server.mjs' in z.namelist()",
  " assert not any('node_modules' in n.split('/') for n in z.namelist())",
  " assert target.stat().st_size < 100_000_000",
  " print('ZIP verified: %d files, %.2f MB'%(len(z.namelist()),target.stat().st_size/1048576))",
].join("\n"), output, archive], { cwd: root, stdio: "inherit" });
if (zip.status !== 0) throw new Error("No se pudo crear/verificar el ZIP para GoDaddy.");
console.log(`Paquete GoDaddy listo: ${archive}`);
