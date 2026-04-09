-- =============================================
-- 008: PRESUPUESTOS
-- =============================================

CREATE TABLE IF NOT EXISTS presupuestos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  orden_id uuid NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  numero_presupuesto int NOT NULL,
  descripcion_trabajo text NOT NULL,
  items jsonb DEFAULT '[]', -- [{concepto, costo_usd}]
  total_usd numeric(10,2),
  tasa_bcv numeric(12,4),
  total_bs numeric(14,2),
  estado text DEFAULT 'pendiente', -- 'pendiente' | 'aprobado' | 'rechazado'
  fecha_vencimiento timestamptz,
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Secuencia de presupuestos por tenant
CREATE TABLE IF NOT EXISTS presupuestos_secuencia (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  ultimo_numero int DEFAULT 0
);

ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "presupuestos_tenant" ON presupuestos FOR ALL USING (tenant_id = get_tenant_id());

CREATE OR REPLACE FUNCTION generar_numero_presupuesto(p_tenant_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_numero int;
BEGIN
  INSERT INTO presupuestos_secuencia (tenant_id, ultimo_numero)
  VALUES (p_tenant_id, 1)
  ON CONFLICT (tenant_id)
  DO UPDATE SET ultimo_numero = presupuestos_secuencia.ultimo_numero + 1
  RETURNING ultimo_numero INTO v_numero;
  RETURN v_numero;
END;
$$;
