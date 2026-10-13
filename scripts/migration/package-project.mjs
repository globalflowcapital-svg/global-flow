import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const output = path.join(root, "generated-artifacts/global-flow-hostinger");
const source = path.join(output, "source");
const requireAPI = createRequire(path.join(root, "artifacts/api-server/package.json"));
const { build } = requireAPI("esbuild");
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(source, { recursive: true });
let files;
try {
  files = execFileSync("git", ["ls-files", "-z"], { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString().split("\0").filter(Boolean);
  // Extracted source has no Git repository of its own.
  const gitRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: root }).toString().trim();
  if (gitRoot !== root) throw new Error("El repositorio Git pertenece a un directorio padre.");
} catch {
  files = [];
  async function collect(directory, prefix = "") {
    for (const item of await fs.readdir(directory, { withFileTypes: true })) {
      if (["node_modules", "dist", ".git", ".agents", ".local", ".cache", ".config", "generated-artifacts"].includes(item.name)) continue;
      const relative = path.join(prefix, item.name);
      if (item.isDirectory()) await collect(path.join(directory, item.name), relative);
      else if (item.isFile()) files.push(relative);
    }
  }
  await collect(root);
}
for (const relative of files) {
  if (/^(?:\.agents|\.git|\.local|\.cache|\.config|generated-artifacts)\//.test(relative)) continue;
  if (/(?:^|\/)\.env(?:\.|$)/.test(relative)) continue;
  if (/\.(?:zip|tar\.gz|tgz|pem|key|dump|sqlite|db|tsbuildinfo)$/.test(relative)) continue;
  if (/(?:^|\/)(?:node_modules|dist)\//.test(relative)) continue;
  const destination = path.join(source, relative);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(path.join(root, relative), destination);
}
// Include the migration tooling even before its first Git checkpoint.
await fs.cp(path.join(root, "scripts/migration"), path.join(source, "scripts/migration"), { recursive: true });

const adminPath = path.join(source, "artifacts/landing-page/src/pages/Admin.tsx");
let admin = await fs.readFile(adminPath, "utf8");
const fixedPassword = admin.match(/const ADMIN_PASSWORD = "([^"]+)";/);
if (!fixedPassword && !admin.includes("gf_admin_token")) throw new Error("No se encontró el bloque de autenticación esperado; revisar antes de exportar.");
if (fixedPassword) {
admin = admin.replace(/^const ADMIN_PASSWORD = .*;\s*\/\/.*$/m, "");
admin = admin.replace("const handleSubmit = (e: React.FormEvent) => {", "const handleSubmit = async (e: React.FormEvent) => {");
admin = admin.replace(
  'if (pw === ADMIN_PASSWORD) {',
  'let valid = false;\n    try {\n      const response = await fetch("/api/admin/check", { headers: { Authorization: `Bearer ${pw}` } });\n      valid = response.status === 204;\n    } catch { valid = false; }\n    if (valid) {\n      sessionStorage.setItem("gf_admin_token", pw);',
);
admin = admin.replace('`Bearer ${ADMIN_PASSWORD}`', '`Bearer ${sessionStorage.getItem("gf_admin_token") || ""}`');
admin = admin.replace('sessionStorage.removeItem("gf_admin");', 'sessionStorage.removeItem("gf_admin"); sessionStorage.removeItem("gf_admin_token");');
}
if (admin.includes("ADMIN_PASSWORD")) throw new Error("Referencia de contraseña incrustada sin eliminar.");
await fs.writeFile(adminPath, admin);
const routePath = path.join(source, "artifacts/api-server/src/routes/leads.ts");
let route = await fs.readFile(routePath, "utf8");
route = route.replace(/process\.env\.ADMIN_PASSWORD \?\? "[^"]+"/, 'process.env.ADMIN_PASSWORD');
route = route.replace("if (token !== ADMIN_PASSWORD)", "if (!ADMIN_PASSWORD || token !== ADMIN_PASSWORD)");
await fs.writeFile(routePath, route);
// Remove any copies of the old fixed password from other text source files.
async function scrub(directory) {
  for (const item of await fs.readdir(directory, { withFileTypes: true })) {
    const p = path.join(directory, item.name);
    if (item.isDirectory()) await scrub(p);
    else if (/\.(?:tsx?|jsx?|mjs|cjs|json|md|html|txt|yaml|yml|css|sql|sh)$/.test(item.name)) {
      const text = await fs.readFile(p, "utf8");
      if (fixedPassword && text.includes(fixedPassword[1])) {
        await fs.writeFile(p, text.split(fixedPassword[1]).join("REEMPLAZAR_CON_VARIABLE_PRIVADA"));
      }
    }
  }
}
await scrub(source);
for (const [name, base, port] of [["landing-page", "/", "3101"], ["day-planner", "/day-planner/", "3102"]]) {
  const config = path.join(source, `artifacts/${name}/vite.config.ts`);
  let vite = await fs.readFile(config, "utf8");
  vite = vite.replace('process.env.PORT;', `process.env.PORT || "${port}";`);
  vite = vite.replace('process.env.BASE_PATH;', `process.env.BASE_PATH || "${base}";`);
  vite = vite.replace(/import runtimeErrorOverlay from "[^"]+";\n/, "");
  vite = vite.replace(/\s*runtimeErrorOverlay\(\),/, "");
  await fs.writeFile(config, vite);
}
// Reuse the installed build tools without shipping node_modules.
await fs.symlink(path.join(root, "node_modules"), path.join(source, "node_modules"), "dir");
for (const name of ["landing-page", "day-planner", "api-server"]) {
  await fs.symlink(path.join(root, `artifacts/${name}/node_modules`), path.join(source, `artifacts/${name}/node_modules`), "dir");
}
for (const name of ["landing-page", "day-planner"]) {
  const artifact = path.join(source, `artifacts/${name}`);
  execFileSync("pnpm", ["exec", "vite", "build"], {
    cwd: artifact, stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production", PORT: name === "landing-page" ? "3101" : "3102", BASE_PATH: name === "landing-page" ? "/" : "/day-planner/" },
  });
  await fs.cp(path.join(artifact, "dist/public"), name === "landing-page" ? path.join(output, "public") : path.join(output, "public/day-planner"), { recursive: true });
  await fs.rm(path.join(artifact, "dist"), { recursive: true, force: true });
}
await build({
  entryPoints: [path.join(source, "scripts/migration/server.ts")],
  outfile: path.join(output, "server.mjs"),
  bundle: true, platform: "node", format: "esm", target: "node22", sourcemap: false,
  external: ["express", "cors", "pino", "pino-http", "cookie-parser", "zod", "drizzle-orm", "pg"],
  banner: { js: "import {createRequire as __createRequire} from 'node:module'; const require = __createRequire(import.meta.url);" },
});
await fs.rm(path.join(source, "node_modules"));
for (const name of ["landing-page", "day-planner", "api-server"]) await fs.rm(path.join(source, `artifacts/${name}/node_modules`));
const dependencies = {};
for (const name of ["express", "cors", "pino", "pino-http", "cookie-parser", "zod", "drizzle-orm"]) {
  dependencies[name] = JSON.parse(await fs.readFile(path.join(root, "artifacts/api-server/node_modules", name, "package.json"), "utf8")).version;
}
dependencies.pg = JSON.parse(await fs.readFile(path.join(root, "lib/db/node_modules/pg/package.json"), "utf8")).version;
await fs.writeFile(path.join(output, "package.json"), JSON.stringify({
  name: "global-flow-hostinger", version: "1.0.0", private: true, type: "module",
  engines: { node: ">=22 <25" },
  scripts: { build: "node scripts/verify-package.mjs", start: "node --env-file-if-exists=.env server.mjs" },
  dependencies,
}, null, 2));
await fs.mkdir(path.join(output, "database"), { recursive: true });
await fs.mkdir(path.join(output, "scripts"), { recursive: true });
await fs.copyFile(path.join(root, "scripts/migration/schema.sql"), path.join(output, "database/schema.sql"));
await fs.copyFile(path.join(root, "scripts/migration/verify-package.mjs"), path.join(output, "scripts/verify-package.mjs"));
await fs.copyFile(path.join(root, "scripts/migration/GUIA-HOSTINGER.md"), path.join(output, "LEEME-HOSTINGER.md"));
await fs.writeFile(path.join(output, ".env.example"),
  "# Ejemplo, no contiene secretos reales. Configura las variables en hPanel.\nNODE_ENV=production\nPORT=3000\nDATABASE_URL=REEMPLAZAR_CON_URL_POSTGRESQL\nADMIN_PASSWORD=REEMPLAZAR_CON_CONTRASENA_NUEVA_DE_16_O_MAS_CARACTERES\n");
execFileSync("npm", ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: output, stdio: "inherit" });
console.log(`Paquete generado en ${output}`);
