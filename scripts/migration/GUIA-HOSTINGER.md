# Global Flow — migración sencilla a Hostinger

## 1. Qué recibes

El ZIP contiene una aplicación lista para desplegar, sin GitHub:

- `server.mjs`: API compilada y servidor de los sitios.
- `public/`: landing, panel de administración, imágenes y vídeo.
- `public/day-planner/`: el segundo sitio, en su estado actual.
- `database/schema.sql`: estructura de la tabla de contactos, sin datos.
- `package.json` y `package-lock.json`: dependencias de producción.
- `.env.example`: nombres de las variables, NO contraseñas reales.
- `source/`: código fuente completo del proyecto, incluidas las aplicaciones,
  bibliotecas compartidas y el sandbox de diseño. No se sirve al público.

No contiene credenciales, contactos, historial Git, dependencias instaladas,
cachés ni archivos ZIP antiguos. El código de la aplicación en Replit no cambia.
La contraseña antigua de administración no funciona en esta copia: configurarás
una contraseña nueva en Hostinger y el servidor la validará.

## 2. Qué plan necesitas

La ruta más sencilla es **Hostinger Business Web Hosting o Cloud con Web Apps /
aplicaciones Node.js**, y una base de datos PostgreSQL en Supabase.

El proyecto utiliza PostgreSQL. No se puede conectar sin cambios a una base
MySQL de Hostinger ni ejecutarse íntegramente como una web HTML/PHP.
Un plan sin aplicaciones Node.js no sirve para este ZIP completo. No lo subas
por FTP directamente a `public_html`: eso no inicia la API.

No necesitas un VPS para la opción recomendada. Supabase es un servicio aparte:
revisa sus cuotas, pausas por inactividad y condiciones antes de elegir un plan.
Para una operación comercial estable, elige un servicio de base de datos que
no se suspenda por inactividad.

## 3. Crear la base de datos: una sola vez

1. Entra en `https://supabase.com` y crea un proyecto.
2. Elige una región cercana a tu servidor de Hostinger.
3. Define una contraseña fuerte para la base de datos y guárdala de forma privada.
4. Abre el **SQL Editor** del proyecto.
5. Extrae el ZIP en tu computador, abre `database/schema.sql`, copia todo su
   contenido en el SQL Editor y pulsa **Run**.
6. Abre **Connect** en Supabase y busca la conexión PostgreSQL en modo
   **Session pooler**, puerto **5432**, compatible con IPv4.
7. Copia la URI PostgreSQL e introduce la contraseña donde aparezca
   `[YOUR-PASSWORD]`. Si contiene caracteres especiales, deben codificarse
   para una URL; usa la cadena generada por tu proveedor.
8. Utiliza TLS según la configuración de tu proveedor; para Supabase, la
   cadena puede llevar `?sslmode=require`.

La URI tiene un formato similar a este, con tus datos reales:

```text
postgresql://postgres.TU_PROYECTO:TU_PASSWORD@TU_HOST_POOLER:5432/postgres?sslmode=require
```

**No publiques esa URI ni la pegues en GitHub o en el chat.**

El asistente de Supabase dentro de Hostinger puede crear `SUPABASE_URL` y
`SUPABASE_ANON_KEY`; estas variables NO reemplazan `DATABASE_URL` en esta
aplicación. Necesitamos la conexión PostgreSQL anterior.

El SQL incluido activa RLS para impedir el acceso anónimo a los contactos
desde la API pública de Supabase. El servidor usa la conexión privada del
rol `postgres`; no uses la clave anónima del navegador.

## 4. Subir el ZIP a Hostinger

1. Entra en **hPanel → Websites / Sitios web → Add Website / Añadir sitio web**.
2. Selecciona **Node.js web app / Aplicación web Node.js**.
3. Selecciona **Upload your files / Subir tus archivos**.
4. Sube el ZIP `global-flow-hostinger.zip` SIN extraerlo.
5. Revisa los ajustes detectados y utiliza:

| Ajuste | Valor |
|---|---|
| Framework | Express |
| Node.js | 22 o 24 |
| Gestor de paquetes | npm |
| Directorio raíz | `/` o vacío |
| Script de compilación | `build` |
| Comando, si pide un comando completo | `npm run build` |
| Archivo de entrada | `server.mjs` |
| Directorio de salida | vacío; Express despliega la raíz completa |
| Comando de inicio, si lo pide | `npm start` |

Los sitios y la API ya están compilados. El script `build` verifica el paquete,
por lo que Hostinger NO tiene que compilar el monorepo ni instalar pnpm.
No selecciones `source/` como raíz: es la copia editable, no el despliegue preparado.

6. En **Environment variables / Variables de entorno**, configura:

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URI PostgreSQL privada del paso anterior |
| `ADMIN_PASSWORD` | contraseña NUEVA, única, de al menos 16 caracteres |

No agregues `ADMIN_PASSWORD` como variable `VITE_*`: esas variables se incorporan
al código que descarga cualquier visitante. No copies contraseñas en los archivos.
No necesitas `SESSION_SECRET`, `BASE_PATH` ni variables especiales de Replit.
El servidor acepta el `PORT` que suministre Hostinger; si el panel te exige uno,
utiliza `3000`.

7. Pulsa **Deploy / Desplegar**.
8. Si necesitas corregir una variable posteriormente, abre la aplicación,
   actualiza sus variables y vuelve a desplegar o reinicia el proceso.

**Importante:** si el dominio ya tiene una web en Hostinger, el flujo puede pedir
liberar ese dominio. No borres la web existente ni cambies sus DNS hasta tener
una copia de seguridad y probar esta aplicación con un dominio temporal.

## 5. Probar antes de cambiar el dominio

Usa primero la dirección temporal que Hostinger te ofrezca.

- `/`: debe cargar la landing, imágenes y vídeo.
- `/admin`: introduce la NUEVA `ADMIN_PASSWORD`; debe abrir el panel.
- `/api/healthz`: debe responder con JSON; comprueba solo que el proceso vive.
- `/day-planner/`: abre el segundo sitio tal como existe actualmente.
- `/landing-page/` y `/landing-page/admin`: redirigen a `/` y `/admin`.

La respuesta del endpoint de salud no garantiza que la base de datos funcione.
Compruébala con un contacto de prueba y verificando que aparezca en `/admin`.
Hazlo en una copia de pruebas. **La landing mantiene el Pixel de Meta existente
y enviar el formulario puede registrar una conversión real**; para probar en
producción, usa la función de eventos de prueba de Meta o evita el envío hasta
estar preparado. Un bloqueo del Pixel por un navegador no bloquea la API.

Prueba también refrescar `/admin`, cerrar sesión y volver a entrar.
Verifica el funcionamiento de los enlaces externos, el vídeo y el diseño móvil.
No confirmes eliminaciones de contactos reales durante las pruebas.

## 6. Conectar tu dominio

1. En Hostinger, asigna el dominio a esta aplicación Node.js.
2. Si el dominio está en otro proveedor, sigue los registros DNS que Hostinger
   indique. No inventes una IP ni copies la dirección de desarrollo de Replit.
3. Mantén intactos los registros de correo (`MX`, SPF, DKIM, DMARC).
4. Activa o verifica el certificado SSL y utiliza siempre `https://`.
5. Espera a que los DNS se propaguen y repite las comprobaciones del paso 5.
6. Revisa en Meta Business que el dominio final esté autorizado y que el Pixel
   reciba los eventos esperados. El identificador del Pixel no se ha cambiado.
7. Conserva Replit funcionando hasta confirmar que la nueva web y los datos
   funcionan correctamente. No cierres ni elimines el servicio anterior aún.

## 7. Si quieres conservar los contactos existentes

**El ZIP no incluye contactos.** Sin importar datos, la nueva base estará vacía.
La migración de datos debe hacerse separadamente y de forma privada.

Opción de respaldo básico: desde el panel de administración actual, descarga
el CSV. Consérvalo fuera de GitHub y del ZIP. Ese CSV es para consulta/respaldo:
sus nombres de columnas y fechas no son un volcado PostgreSQL listo para restaurar.

Para trasladar fielmente los registros, utiliza el cliente PostgreSQL `pg_dump`
contra la base que utiliza tu web REAL, no otra base de desarrollo:

```bash
# ORIGEN_DATABASE_URL debe configurarse de forma privada en tu equipo.
# Exportación de solo lectura. No imprime la contraseña.
pg_dump "$ORIGEN_DATABASE_URL" \
  --data-only --column-inserts --table=public.leads \
  --no-owner --no-privileges > contactos.sql
```

Hazlo en una máquina con el cliente PostgreSQL compatible con la versión
del servidor. Para una base interna de Replit accesible solo desde su entorno,
haz el volcado allí. Verifica que estás usando la conexión correcta de producción.
Descarga el archivo de forma privada, no lo publiques como recurso de la web.

Restaura SOLO sobre la nueva base, después de crear la tabla con `schema.sql`:

```bash
# DESTINO_DATABASE_URL es la URI privada de la nueva base.
psql "$DESTINO_DATABASE_URL" -v ON_ERROR_STOP=1 \
  --single-transaction -f contactos.sql
psql "$DESTINO_DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  "SELECT setval(pg_get_serial_sequence('public.leads','id'), COALESCE((SELECT MAX(id) FROM public.leads),1), EXISTS(SELECT 1 FROM public.leads));"
```

Usa una base nueva/vacía para evitar IDs duplicados. No uses `--clean` ni borres
tablas existentes. Comprueba el número de contactos en origen y destino antes
del cambio de dominio. Una migración final requiere evitar escrituras nuevas
durante el volcado/cambio, o repetirla sobre una base vacía con los datos finales.
Si los contactos nuevos empiezan a llegar al servidor anterior durante el
cambio DNS, reconcilia esos registros antes de apagarlo.

## 8. Si algo falla

| Problema | Qué comprobar |
|---|---|
| No aparece la opción Node.js | El plan debe admitir Web Apps; un hosting solo HTML/PHP no basta. |
| La instalación falla | Node 22/24, npm, raíz `/`, no `source/`. Consulta Build logs. |
| Proceso no inicia | Variables `DATABASE_URL` y `ADMIN_PASSWORD` configuradas; entrada `server.mjs`. |
| `ENETUNREACH` al conectar a Supabase | Usa Session pooler compatible con IPv4 en vez de la conexión directa IPv6. |
| Error de contraseña de PostgreSQL | URI, contraseña y codificación de caracteres; no confundirla con la del admin. |
| `relation "leads" does not exist` | Ejecuta `database/schema.sql` en la base indicada por `DATABASE_URL`. |
| Salud OK, formulario falla | Mira Runtime Logs: el endpoint de salud no consulta PostgreSQL. |
| Admin no permite entrar | Usa la NUEVA contraseña; reinicia/despliega tras cambiar variables. |
| Página devuelve HTML en vez de JSON | Verifica que se desplegó como Express, no como sitio estático. |
| Archivos/vídeo no cargan | Despliega el ZIP entero, conservando la carpeta `public/`. |
| Veo un planner básico | Se conservó el estado actual del segundo sitio; la migración no añade funciones. |

No compartas logs que contengan URI, contraseñas o datos personales.

## 9. Actualizaciones y otros servidores

La carpeta `source/` conserva el monorepo editable. Para reconstruir un paquete
después de cambiar el código, usa Node 22/24, instala pnpm y, dentro de `source/`:

```bash
pnpm install --frozen-lockfile
node scripts/migration/package-project.mjs
```

El nuevo paquete se genera en `generated-artifacts/global-flow-hostinger/`.
Comprímelo desde dentro de esa carpeta, sin `node_modules` ni bases de datos.
Vuelve a subirlo como una nueva versión en Hostinger. No edites solo los archivos
compilados: tus cambios deben conservarse en `source/`.

El mismo paquete también sirve en un servidor con Node y PostgreSQL:

```bash
npm ci
cp .env.example .env
# Edita .env en privado y configura DATABASE_URL y ADMIN_PASSWORD.
# Ejecuta database/schema.sql sobre una base nueva.
npm run build
npm start
```

En un VPS necesitas además un gestor de procesos, proxy inverso y HTTPS.
No dejes `npm start` en una terminal como única solución de producción.
La opción administrada de Hostinger evita esas tareas.

## Fuentes oficiales consultadas

- https://docs.hostinger.com/node.js/creating-an-app
- https://docs.hostinger.com/node.js/build-settings
- https://docs.hostinger.com/node.js/overview
- https://supabase.com/docs/guides/database/connecting-to-postgres

Las pantallas y planes pueden cambiar. Estas instrucciones usan la documentación
consultada al preparar el paquete, no dependen de la conexión GitHub de Replit.
