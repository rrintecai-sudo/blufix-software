-- =============================================
-- 009: LIQUIDACIONES SEMANALES DE TÉCNICOS
-- =============================================

CREATE TABLE IF NOT EXISTS liquidaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tecnico_id uuid REFERENCES tecnicos(id),
  tecnico_nombre text NOT NULL,
  sucursal_id uuid REFERENCES sucursales(id),
  periodo_desde timestamptz NOT NULL,
  periodo_hasta timestamptz NOT NULL,
  total_comision_usd numeric(10,2),
  tasa_pago numeric(12,4),
  total_pagar_bs numeric(14,2),
  estado text DEFAULT 'pendiente', -- 'pendiente' | 'pagado'
  fecha_pago timestamptz,
  notas text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE liquidaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "liquidaciones_tenant" ON liquidaciones FOR ALL USING (tenant_id = get_tenant_id());
