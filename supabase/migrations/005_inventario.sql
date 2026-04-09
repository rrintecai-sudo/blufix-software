-- =============================================
-- 005: INVENTARIO Y MOVIMIENTOS
-- =============================================

CREATE TABLE IF NOT EXISTS inventario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sucursal_id uuid REFERENCES sucursales(id),
  nombre text NOT NULL,
  referencia text,
  categoria text, -- 'pantalla' | 'bateria' | 'flex' | 'conector' | 'camara' | 'botones' | 'carcasa' | 'otro'
  marca text,
  modelo_compatible text,
  proveedor_id uuid REFERENCES proveedores(id),
  stock_actual int DEFAULT 0,
  stock_minimo int DEFAULT 2,
  costo_usd numeric(10,2) DEFAULT 0,
  precio_venta_usd numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventario_tenant" ON inventario FOR ALL USING (tenant_id = get_tenant_id());

-- Movimientos de inventario
CREATE TABLE IF NOT EXISTS inventario_movimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  inventario_id uuid NOT NULL REFERENCES inventario(id),
  orden_id uuid, -- FK a ordenes, se agrega después
  tipo text NOT NULL, -- 'entrada' | 'salida' | 'ajuste'
  cantidad int NOT NULL,
  costo_usd numeric(10,2),
  tasa_bcv numeric(12,4),
  notas text,
  usuario_id text REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inventario_movimientos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_movimientos_tenant" ON inventario_movimientos FOR ALL USING (tenant_id = get_tenant_id());

-- Trigger: actualizar updated_at en inventario
CREATE OR REPLACE FUNCTION update_inventario_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventario_updated_at
  BEFORE UPDATE ON inventario
  FOR EACH ROW EXECUTE FUNCTION update_inventario_updated_at();
