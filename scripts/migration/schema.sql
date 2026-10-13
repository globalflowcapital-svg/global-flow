-- Run on a NEW PostgreSQL database. This does not contain personal data.
CREATE TABLE IF NOT EXISTS public.leads (
  id serial PRIMARY KEY,
  nombre text NOT NULL,
  pais text NOT NULL,
  codigo_pais text NOT NULL,
  whatsapp text NOT NULL,
  operado_criptos boolean NOT NULL,
  nivel text NOT NULL,
  fuente text,
  created_at timestamp NOT NULL DEFAULT now()
);
-- Protect this table from Supabase's anonymous browser API.
-- The server connects with the database's postgres role.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
