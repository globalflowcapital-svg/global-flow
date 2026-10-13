# Global Flow — GoDaddy Node.js Hosting

This ZIP is prepared for **GoDaddy Node.js Hosting**, the managed upload-and-deploy
service. It is not the GoDaddy WordPress/website builder or ordinary shared PHP
hosting. This GoDaddy product is in beta; confirm that GoDaddy Node.js Hosting
is available for your account and region before starting.

## Upload without GitHub

1. Open **GoDaddy Node.js Hosting** and start creating an app.
2. Choose **Upload a ZIP** / **Upload files** and select
   `global-flow-godaddy.zip`. The ZIP is under GoDaddy's published 100 MB limit.
3. Choose **“I need to add secrets for my app to boot”** if the setup screen
   asks for secrets. Enter the two private values below. If you don't see that
   option on import, open the deployed app's **Settings → Secrets**.
4. Import and deploy the app to its private preview.
5. Open the preview URL and test the checks below. The preview is private; use
   GoDaddy sign-in when asked.
6. Set a custom domain in **Settings** when ready and use GoDaddy's **Publish**
   action to send the preview live. Never change your current website's DNS until
   the preview has passed your checks.

The platform handles `npm install`, the `build` script, the `start` script,
process restarts, HTTPS, and `PORT`. This ZIP has a root-level `package.json`
with `name`, `version`, `main`, `build`, and `start`; all runtime modules are
listed in `dependencies`. It contains **no `node_modules`, no GitHub dependency,
no Replit workflow settings, and no production `.env` file**.

## Private settings to enter in GoDaddy

Do **not** upload or commit a real `.env` file. Add these variables in the
GoDaddy Secrets screen:

| Name | Value |
|---|---|
| `DATABASE_URL` | Private PostgreSQL connection URI, as described below |
| `ADMIN_PASSWORD` | A new, unique password, at least 16 characters |

`PORT` is set by GoDaddy. The bundled server defaults to production mode;
`NODE_ENV=production` is also safe to add in Settings. Do not use `VITE_` in
front-end secrets: Vite variables become public browser code.

The old administrator password is deliberately not included. The migration
copy checks `ADMIN_PASSWORD` on the server and refuses to start without a
sufficiently long new password. Enter the same new value when signing in at
`/admin`.

## PostgreSQL: create once

This application stores contact form submissions in PostgreSQL. GoDaddy's
upload does not migrate your previous database, and its app Database screen
should not be assumed to be a PostgreSQL connection for this application.
Connect an external PostgreSQL database using its server-side URI. Supabase
PostgreSQL is one compatible option; review its availability, pricing, storage,
backups and inactivity policy before selecting a service.

1. Create a PostgreSQL project in your selected provider, near GoDaddy's
   application region.
2. In its SQL Editor, run the ZIP's `database/schema.sql` once. This creates the
   empty `leads` table without restoring or deleting any records.
3. Copy the provider's server-side PostgreSQL URI. For Supabase, use the
   **Session pooler**, port **5432**, which supports IPv4. Do not use the
   browser's anon/public API key.
4. Add the complete URI as the GoDaddy `DATABASE_URL` secret. Keep the URI,
   database password and exported contact data private. Encode special
   characters in the URI password as required by the provider.

Format example only — the example values do not work:

```text
postgresql://postgres.YOUR_PROJECT:YOUR_PASSWORD@YOUR_SESSION_POOLER_HOST:5432/postgres?sslmode=require
```

In this app, `DATABASE_URL` is required by the Node PostgreSQL driver.
`SUPABASE_URL` and `SUPABASE_ANON_KEY` alone do **not** connect it to PostgreSQL.

## Preview checklist

Use a GoDaddy **preview** first:

- `/` — landing page.
- `/admin` — log in with the newly configured `ADMIN_PASSWORD`.
- `/api/healthz` — confirms the server is running. **It does not test PostgreSQL.**
- `/day-planner/` — the second site in its current project state.
- Submit one intended test lead and verify it in `/admin` before inviting real
  visitors. The marketing form is connected to the live Meta Pixel; a test
  submission in production may record a real conversion. Use Meta's test-events
  procedure or do not send a test form from production.
- Test logout, reload, mobile layout, image/video loading and a fresh admin login.

Use GoDaddy's **Runtime Logs** for startup or database errors. An HTTP health
response does not establish that a PostgreSQL credential works. Do not share a
log that includes a connection URI, administrator password or personal data.

GoDaddy documents that free previews can be removed after 30 days. Publish the
application or follow GoDaddy's current preview retention rules rather than
using a preview as the permanent production site.

## Existing contact records

The package intentionally contains no contacts or other personal data. If you
want to keep existing leads, export/import them separately and privately. Back
up the production database, not a development copy. The Hostinger migration
guide inside `source/scripts/migration/GUIA-HOSTINGER.md` documents a PostgreSQL
`pg_dump` procedure; adapt its target URI to this GoDaddy app's external
PostgreSQL database. Restore to a new, empty database and check record counts
before switching traffic. Do not overwrite an existing database.

## Source and rebuilding

The full editable monorepo is retained under `source/`; the package root runs
the prebuilt production web apps and API. To regenerate for current source
changes, install Node.js 22 or later and pnpm in the source folder:

```bash
pnpm install --frozen-lockfile
node scripts/migration/package-project.mjs
node scripts/migration/package-godaddy.mjs
```

The new ZIP appears at `generated-artifacts/global-flow-godaddy.zip`. The
GoDaddy packager builds the standalone production bundle and produces a clean
ZIP under 100 MB without runtime modules or live credentials.

Official references (product features may change while Node.js Hosting is in beta):

- https://www.godaddy.com/help/upload-my-ai-generated-app-to-godaddy-nodejs-hosting-42987
- https://www.godaddy.com/help/godaddy-nodejs-hosting-faq-42915
- https://www.godaddy.com/help/deploy-my-cursor-or-claude-app-with-godaddy-nodejs-hosting-42908
- https://supabase.com/docs/guides/database/connecting-to-postgres
