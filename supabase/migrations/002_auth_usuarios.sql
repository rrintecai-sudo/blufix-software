-- =============================================
-- 002: USUARIOS POR TENANT
-- Vincula usuarios de Clerk con tenants del taller
-- Clerk usa IDs de texto (user_xxxx), no uuid
-- =============================================

CREATE TABLE IF NOT EXISTS usuarios (
  id text PRIMARY KEY,  -- Clerk user ID (user_xxxx)
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  email text NOT NULL,
  rol text NOT NULL DEFAULT 'tecnico', -- 'admin' | 'supervisor' | 'tecnico' | 'caja'
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Función helper: obtener tenant_id del usuario autenticado vía JWT de Clerk
-- El JWT de Clerk incluye "sub" = Clerk user ID y "tenant_id" en claims custom
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM usuarios WHERE id = (auth.jwt() ->> 'sub') LIMIT 1;
$$;

CREATE POLICY "usuarios_tenant" ON usuarios
  FOR ALL USING (tenant_id = get_tenant_id());
