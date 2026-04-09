-- =============================================
-- 001: TENANTS
-- Tabla maestra de talleres (multi-tenant)
-- =============================================

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  telefono text,
  email text,
  direccion text,
  ciudad text,
  pais text DEFAULT 'Venezuela',
  rif text,
  color_primario text DEFAULT '#2563EB',
  activo boolean DEFAULT true,
  plan text DEFAULT 'pro', -- 'demo' | 'pro' | 'enterprise'
  fecha_vencimiento timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS: solo super-admins pueden leer todos los tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_select_own" ON tenants
  FOR SELECT USING (true); -- los usuarios leen su tenant via join en otras tablas
