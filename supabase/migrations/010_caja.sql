-- =============================================
-- 010: CAJA DIARIA
-- =============================================

CREATE TABLE IF NOT EXISTS caja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sucursal_id uuid REFERENCES sucursales(id),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  tipo text NOT NULL, -- 'ingreso' | 'egreso'
  categoria text, -- 'reparacion' | 'venta_repuesto' | 'gasto_operativo' | 'otro'
  concepto text NOT NULL,
  monto_usd numeric(10,2),
  monto_bs numeric(14,2),
  tasa_bcv numeric(12,4),
  orden_id uuid REFERENCES ordenes(id),
  metodo_pago text,
  usuario_id text REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE caja ENABLE ROW LEVEL SECURITY;
CREATE POLICY "caja_tenant" ON caja FOR ALL USING (tenant_id = get_tenant_id());
