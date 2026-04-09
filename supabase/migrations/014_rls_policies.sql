-- =============================================
-- 014: POLÍTICAS RLS ADICIONALES Y AJUSTES
-- =============================================

-- Política adicional: técnicos solo ven sus propias órdenes
-- (se aplica cuando el usuario tiene rol 'tecnico')
-- Nota: la lógica de rol se maneja en el frontend/API,
-- RLS garantiza aislamiento por tenant.

-- Permitir que service_role haga todo (para Edge Functions y seeds)
-- Esto se aplica automáticamente ya que service_role bypassa RLS.

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_ordenes_tenant_estado ON ordenes(tenant_id, estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_tenant_created ON ordenes(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente ON ordenes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_tecnico ON ordenes(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_costos_orden ON costos_orden(orden_id);
CREATE INDEX IF NOT EXISTS idx_inventario_tenant ON inventario(tenant_id, categoria);
CREATE INDEX IF NOT EXISTS idx_clientes_tenant ON clientes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tecnicos_tenant ON tecnicos(tenant_id, activo);
CREATE INDEX IF NOT EXISTS idx_caja_tenant_fecha ON caja(tenant_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_liquidaciones_tecnico ON liquidaciones(tenant_id, tecnico_id);
CREATE INDEX IF NOT EXISTS idx_tasas_bcv_fecha ON tasas_bcv(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_notif_whatsapp_orden ON notificaciones_whatsapp(orden_id);
