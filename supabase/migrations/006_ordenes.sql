-- =============================================
-- 006: ÓRDENES DE REPARACIÓN
-- =============================================

-- Secuencia por tenant para número correlativo
CREATE TABLE IF NOT EXISTS ordenes_secuencia (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  ultimo_numero int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ordenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  numero_orden int NOT NULL,
  sucursal_id uuid REFERENCES sucursales(id),
  cliente_id uuid REFERENCES clientes(id),
  tecnico_id uuid REFERENCES tecnicos(id),

  -- Equipo
  marca text NOT NULL,
  modelo text NOT NULL,
  imei text,
  color text,
  falla_reportada text NOT NULL,
  diagnostico text,

  -- Checklist estado del equipo al recibir
  enciende boolean,
  pantalla_ok boolean,
  corneta_ok boolean,
  pin_carga_ok boolean,
  camara_ok boolean,
  botones_ok boolean,
  notas_estado text,

  -- Estado
  estado text NOT NULL DEFAULT 'recibido',
  -- recibido | diagnostico | cotizado | aprobado | en_reparacion | listo | entregado | cancelado

  -- Facturación inicial (congelada al aprobar)
  precio_inicial_usd numeric(10,2),
  tasa_inicial numeric(12,4),
  fecha_inicial timestamptz,

  -- Facturación final (editable hasta entregar)
  precio_cobrado_usd numeric(10,2),
  tasa_evento numeric(12,4),
  fecha_facturacion timestamptz,
  motivo_ajuste_precio text,
  numero_factura text,
  metodo_pago text, -- 'pago_movil' | 'zelle' | 'efectivo' | 'transferencia' | 'cashea'

  -- Garantía
  garantia_dias int DEFAULT 7,
  fecha_entrega timestamptz,
  garantia_vence timestamptz,

  -- Hora prometida
  hora_prometida timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(tenant_id, numero_orden)
);

ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ordenes_tenant" ON ordenes FOR ALL USING (tenant_id = get_tenant_id());

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION update_ordenes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ordenes_updated_at
  BEFORE UPDATE ON ordenes
  FOR EACH ROW EXECUTE FUNCTION update_ordenes_updated_at();

-- Función: generar número correlativo por tenant
CREATE OR REPLACE FUNCTION generar_numero_orden(p_tenant_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_numero int;
BEGIN
  INSERT INTO ordenes_secuencia (tenant_id, ultimo_numero)
  VALUES (p_tenant_id, 1)
  ON CONFLICT (tenant_id)
  DO UPDATE SET ultimo_numero = ordenes_secuencia.ultimo_numero + 1
  RETURNING ultimo_numero INTO v_numero;
  RETURN v_numero;
END;
$$;

-- FK de inventario_movimientos a ordenes
ALTER TABLE inventario_movimientos
  ADD CONSTRAINT fk_inv_mov_orden
  FOREIGN KEY (orden_id) REFERENCES ordenes(id);
