-- =============================================
-- 007: COSTOS DE ORDEN E HISTORIAL DE ESTADOS
-- =============================================

CREATE TABLE IF NOT EXISTS costos_orden (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  orden_id uuid NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  concepto text NOT NULL,
  proveedor_id uuid REFERENCES proveedores(id),
  inventario_id uuid REFERENCES inventario(id),
  costo_usd numeric(10,2) NOT NULL DEFAULT 0,
  notas text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE costos_orden ENABLE ROW LEVEL SECURITY;
CREATE POLICY "costos_orden_tenant" ON costos_orden FOR ALL USING (tenant_id = get_tenant_id());

-- Historial de estados de orden
CREATE TABLE IF NOT EXISTS ordenes_historial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  orden_id uuid NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  estado_anterior text,
  estado_nuevo text NOT NULL,
  notas text,
  usuario_id text REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ordenes_historial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ordenes_historial_tenant" ON ordenes_historial FOR ALL USING (tenant_id = get_tenant_id());
