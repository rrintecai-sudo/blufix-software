-- =============================================
-- 011: WHATSAPP - NOTIFICACIONES Y PLANTILLAS
-- =============================================

CREATE TABLE IF NOT EXISTS notificaciones_whatsapp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  orden_id uuid REFERENCES ordenes(id),
  cliente_telefono text,
  mensaje text,
  estado text DEFAULT 'pendiente', -- 'pendiente' | 'enviado' | 'error'
  enviado_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notificaciones_whatsapp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_whatsapp_tenant" ON notificaciones_whatsapp FOR ALL USING (tenant_id = get_tenant_id());

-- Plantillas de mensajes por tenant y evento
CREATE TABLE IF NOT EXISTS plantillas_whatsapp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  evento text NOT NULL, -- 'orden_recibida' | 'listo_retirar' | 'entregado' | 'presupuesto_listo'
  mensaje text NOT NULL, -- variables: {cliente}, {modelo}, {numero_orden}, {precio}, {taller}
  activo boolean DEFAULT true,
  UNIQUE(tenant_id, evento)
);

ALTER TABLE plantillas_whatsapp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plantillas_whatsapp_tenant" ON plantillas_whatsapp FOR ALL USING (tenant_id = get_tenant_id());
