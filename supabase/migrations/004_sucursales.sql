-- =============================================
-- 004: SUCURSALES
-- =============================================

CREATE TABLE IF NOT EXISTS sucursales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  direccion text,
  telefono text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sucursales_tenant" ON sucursales FOR ALL USING (tenant_id = get_tenant_id());
