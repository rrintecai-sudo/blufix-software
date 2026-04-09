-- =============================================
-- 003: TÉCNICOS, CLIENTES Y PROVEEDORES
-- =============================================

-- Técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  cedula text,
  telefono text,
  fecha_ingreso date,
  porcentaje_comision numeric(5,2) DEFAULT 50.00,
  metodo_pago text, -- 'pago_movil' | 'zelle' | 'efectivo' | 'transferencia'
  datos_pago text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tecnicos_tenant" ON tecnicos FOR ALL USING (tenant_id = get_tenant_id());

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  cedula text,
  telefono text NOT NULL,
  email text,
  direccion text,
  historial_ordenes int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes_tenant" ON clientes FOR ALL USING (tenant_id = get_tenant_id());

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  costo_cero boolean DEFAULT false,
  telefono text,
  notas text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proveedores_tenant" ON proveedores FOR ALL USING (tenant_id = get_tenant_id());
