-- =============================================
-- 013: VISTA CALCULADA ordenes_resumen
-- Incluye costos, ganancias, comisiones en USD y Bs.
-- =============================================

CREATE OR REPLACE VIEW ordenes_resumen AS
SELECT
  o.*,
  t.nombre AS tenant_nombre,
  c.nombre AS cliente_nombre,
  c.telefono AS cliente_telefono,
  tec.nombre AS tecnico_nombre,
  COALESCE(tec.porcentaje_comision, 50) AS porcentaje_comision,
  s.nombre AS sucursal_nombre,

  -- Costos totales
  COALESCE((
    SELECT SUM(co.costo_usd)
    FROM costos_orden co
    WHERE co.orden_id = o.id
  ), 0) AS costo_total_usd,

  -- Ganancia bruta en USD
  COALESCE(o.precio_cobrado_usd, 0) - COALESCE((
    SELECT SUM(co.costo_usd)
    FROM costos_orden co
    WHERE co.orden_id = o.id
  ), 0) AS ganancia_usd,

  -- Comisión técnico en USD
  (COALESCE(o.precio_cobrado_usd, 0) - COALESCE((
    SELECT SUM(co.costo_usd)
    FROM costos_orden co
    WHERE co.orden_id = o.id
  ), 0)) * (COALESCE(tec.porcentaje_comision, 50) / 100.0) AS comision_tecnico_usd,

  -- Conversiones a Bs. con tasa_evento
  COALESCE(o.precio_cobrado_usd, 0) * COALESCE(o.tasa_evento, 1) AS precio_cobrado_bs,

  COALESCE((
    SELECT SUM(co.costo_usd)
    FROM costos_orden co
    WHERE co.orden_id = o.id
  ), 0) * COALESCE(o.tasa_evento, 1) AS costo_total_bs,

  (COALESCE(o.precio_cobrado_usd, 0) - COALESCE((
    SELECT SUM(co.costo_usd)
    FROM costos_orden co
    WHERE co.orden_id = o.id
  ), 0)) * COALESCE(o.tasa_evento, 1) AS ganancia_bs,

  (COALESCE(o.precio_cobrado_usd, 0) - COALESCE((
    SELECT SUM(co.costo_usd)
    FROM costos_orden co
    WHERE co.orden_id = o.id
  ), 0)) * (COALESCE(tec.porcentaje_comision, 50) / 100.0) * COALESCE(o.tasa_evento, 1) AS comision_tecnico_bs

FROM ordenes o
LEFT JOIN tenants t ON o.tenant_id = t.id
LEFT JOIN clientes c ON o.cliente_id = c.id
LEFT JOIN tecnicos tec ON o.tecnico_id = tec.id
LEFT JOIN sucursales s ON o.sucursal_id = s.id;
