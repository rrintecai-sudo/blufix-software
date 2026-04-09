-- =============================================
-- 015: SEED DEMO
-- Datos iniciales para el tenant demo BluFix
-- =============================================

DO $$
DECLARE
  v_tenant_id uuid := gen_random_uuid();
  v_suc_central_id uuid := gen_random_uuid();
  v_suc_norte_id uuid := gen_random_uuid();
  v_tec_cesar_id uuid := gen_random_uuid();
  v_tec_josue_id uuid := gen_random_uuid();
  v_tec_german_id uuid := gen_random_uuid();
  v_prov_central_id uuid := gen_random_uuid();
  v_prov_fhalcom_id uuid := gen_random_uuid();
  v_prov_full_id uuid := gen_random_uuid();
  v_prov_2021_id uuid := gen_random_uuid();
  v_prov_canguro_id uuid := gen_random_uuid();
  v_prov_braco_id uuid := gen_random_uuid();
  v_prov_babilon_id uuid := gen_random_uuid();

  -- Inventario
  v_inv_pant_a25 uuid := gen_random_uuid();
  v_inv_pant_iph11 uuid := gen_random_uuid();
  v_inv_bat_a50 uuid := gen_random_uuid();
  v_inv_flex_a12 uuid := gen_random_uuid();
  v_inv_flex_iphx uuid := gen_random_uuid();
  v_inv_pant_redmi uuid := gen_random_uuid();
  v_inv_bat_iph12 uuid := gen_random_uuid();
  v_inv_cam_a21s uuid := gen_random_uuid();
  v_inv_btn_home uuid := gen_random_uuid();
  v_inv_con_carga uuid := gen_random_uuid();

  -- Clientes
  v_cli1 uuid := gen_random_uuid();
  v_cli2 uuid := gen_random_uuid();
  v_cli3 uuid := gen_random_uuid();
  v_cli4 uuid := gen_random_uuid();
  v_cli5 uuid := gen_random_uuid();
  v_cli6 uuid := gen_random_uuid();
  v_cli7 uuid := gen_random_uuid();
  v_cli8 uuid := gen_random_uuid();
  v_cli9 uuid := gen_random_uuid();
  v_cli10 uuid := gen_random_uuid();

  -- Órdenes
  v_ord1 uuid := gen_random_uuid();
  v_ord2 uuid := gen_random_uuid();
  v_ord3 uuid := gen_random_uuid();
  v_ord4 uuid := gen_random_uuid();
  v_ord5 uuid := gen_random_uuid();
  v_ord6 uuid := gen_random_uuid();
  v_ord7 uuid := gen_random_uuid();
  v_ord8 uuid := gen_random_uuid();
  v_ord9 uuid := gen_random_uuid();
  v_ord10 uuid := gen_random_uuid();
  v_ord11 uuid := gen_random_uuid();
  v_ord12 uuid := gen_random_uuid();

  v_tasa_demo numeric := 475.9580;
BEGIN

-- =========================================
-- TENANT DEMO
-- =========================================
INSERT INTO tenants (id, nombre, slug, color_primario, plan, activo)
VALUES (v_tenant_id, 'Taller Demo BluFix', 'demo', '#2563EB', 'demo', true);

-- Secuencias iniciales
INSERT INTO ordenes_secuencia (tenant_id, ultimo_numero) VALUES (v_tenant_id, 12);
INSERT INTO presupuestos_secuencia (tenant_id, ultimo_numero) VALUES (v_tenant_id, 3);

-- =========================================
-- SUCURSALES
-- =========================================
INSERT INTO sucursales (id, tenant_id, nombre, direccion, telefono, activo) VALUES
  (v_suc_central_id, v_tenant_id, 'Tienda Central', 'Av. Libertador, Centro Comercial Las Vegas, Local 12', '0412-1234567', true),
  (v_suc_norte_id, v_tenant_id, 'Sucursal Norte', 'C.C. Metrópolis, Nivel PB, Local 45', '0414-7654321', true);

-- =========================================
-- TÉCNICOS
-- =========================================
INSERT INTO tecnicos (id, tenant_id, nombre, cedula, telefono, porcentaje_comision, metodo_pago, activo) VALUES
  (v_tec_cesar_id, v_tenant_id, 'César Rodríguez', 'V-18.234.567', '0424-1122334', 50.00, 'pago_movil', true),
  (v_tec_josue_id, v_tenant_id, 'Josué Martínez', 'V-20.345.678', '0416-9988776', 45.00, 'zelle', true),
  (v_tec_german_id, v_tenant_id, 'German Brito', 'V-22.456.789', '0412-5566778', 50.00, 'efectivo', true);

-- =========================================
-- PROVEEDORES
-- =========================================
INSERT INTO proveedores (id, tenant_id, nombre, costo_cero, activo) VALUES
  (v_prov_central_id, v_tenant_id, 'Central', false, true),
  (v_prov_fhalcom_id, v_tenant_id, 'Fhalcom', false, true),
  (v_prov_full_id, v_tenant_id, 'Full', true, true),
  (v_prov_2021_id, v_tenant_id, '2021 Cell', false, true),
  (v_prov_canguro_id, v_tenant_id, 'Canguro', false, true),
  (v_prov_braco_id, v_tenant_id, 'Braco', false, true),
  (v_prov_babilon_id, v_tenant_id, 'Babilon', false, true);

-- =========================================
-- INVENTARIO (10 piezas)
-- =========================================
INSERT INTO inventario (id, tenant_id, sucursal_id, nombre, categoria, marca, modelo_compatible, proveedor_id, stock_actual, stock_minimo, costo_usd, precio_venta_usd) VALUES
  (v_inv_pant_a25, v_tenant_id, v_suc_central_id, 'Pantalla Samsung A25', 'pantalla', 'Samsung', 'Samsung A25, A25s', v_prov_central_id, 3, 2, 18.00, 25.00),
  (v_inv_pant_iph11, v_tenant_id, v_suc_central_id, 'Pantalla iPhone 11', 'pantalla', 'Apple', 'iPhone 11', v_prov_fhalcom_id, 1, 2, 35.00, 50.00),
  (v_inv_bat_a50, v_tenant_id, v_suc_central_id, 'Batería Samsung A50', 'bateria', 'Samsung', 'Samsung A50, A30s', v_prov_central_id, 5, 3, 8.00, 12.00),
  (v_inv_flex_a12, v_tenant_id, v_suc_norte_id, 'Flex de carga Samsung A12', 'flex', 'Samsung', 'Samsung A12, A13', v_prov_2021_id, 4, 2, 4.00, 7.00),
  (v_inv_flex_iphx, v_tenant_id, v_suc_norte_id, 'Flex de carga iPhone X', 'flex', 'Apple', 'iPhone X, XS', v_prov_fhalcom_id, 2, 2, 6.00, 10.00),
  (v_inv_pant_redmi, v_tenant_id, v_suc_central_id, 'Pantalla Xiaomi Redmi 9', 'pantalla', 'Xiaomi', 'Redmi 9, 9A', v_prov_canguro_id, 2, 1, 12.00, 18.00),
  (v_inv_bat_iph12, v_tenant_id, v_suc_central_id, 'Batería iPhone 12', 'bateria', 'Apple', 'iPhone 12, 12 Mini', v_prov_braco_id, 3, 2, 15.00, 22.00),
  (v_inv_cam_a21s, v_tenant_id, v_suc_norte_id, 'Cámara trasera Samsung A21s', 'camara', 'Samsung', 'Samsung A21s', v_prov_babilon_id, 1, 1, 10.00, 16.00),
  (v_inv_btn_home, v_tenant_id, v_suc_central_id, 'Botón home Samsung', 'botones', 'Samsung', 'Samsung S6, S7, A5', v_prov_central_id, 6, 3, 2.00, 4.00),
  (v_inv_con_carga, v_tenant_id, v_suc_central_id, 'Conector carga universal', 'conector', 'Universal', 'Varios modelos', v_prov_2021_id, 8, 4, 1.50, 3.00);

-- =========================================
-- CLIENTES (10)
-- =========================================
INSERT INTO clientes (id, tenant_id, nombre, cedula, telefono, email) VALUES
  (v_cli1, v_tenant_id, 'María González', 'V-12.345.678', '0412-1111111', 'maria.g@gmail.com'),
  (v_cli2, v_tenant_id, 'Carlos Pérez', 'V-15.678.901', '0414-2222222', NULL),
  (v_cli3, v_tenant_id, 'Ana Rodríguez', 'V-18.901.234', '0416-3333333', 'ana.rod@hotmail.com'),
  (v_cli4, v_tenant_id, 'Luis Hernández', 'V-20.234.567', '0424-4444444', NULL),
  (v_cli5, v_tenant_id, 'Sofía Díaz', 'V-22.567.890', '0426-5555555', 'sofia.diaz@gmail.com'),
  (v_cli6, v_tenant_id, 'José Martínez', 'V-14.890.123', '0412-6666666', NULL),
  (v_cli7, v_tenant_id, 'Laura Torres', 'V-17.123.456', '0414-7777777', 'ltorres@yahoo.com'),
  (v_cli8, v_tenant_id, 'Pedro Ramírez', 'V-19.456.789', '0416-8888888', NULL),
  (v_cli9, v_tenant_id, 'Valentina Castro', 'V-21.789.012', '0424-9999999', 'vcastro@gmail.com'),
  (v_cli10, v_tenant_id, 'Andrés Morales', 'V-23.012.345', '0426-0000000', NULL);

-- =========================================
-- ÓRDENES (12 en distintos estados)
-- =========================================
INSERT INTO ordenes (
  id, tenant_id, numero_orden, sucursal_id, cliente_id, tecnico_id,
  marca, modelo, falla_reportada, estado,
  enciende, pantalla_ok, corneta_ok, pin_carga_ok, camara_ok, botones_ok,
  precio_cobrado_usd, tasa_evento, fecha_facturacion,
  garantia_dias, fecha_entrega, garantia_vence,
  created_at, updated_at
) VALUES
-- 1. Entregada - con costos reales
(v_ord1, v_tenant_id, 1, v_suc_central_id, v_cli1, v_tec_cesar_id,
  'Samsung', 'A25', 'Pantalla rota', 'entregado',
  true, false, true, true, true, true,
  35.00, v_tasa_demo, now() - interval '5 days',
  7, now() - interval '5 days', now() + interval '2 days',
  now() - interval '7 days', now() - interval '5 days'),

-- 2. Lista para retirar
(v_ord2, v_tenant_id, 2, v_suc_central_id, v_cli2, v_tec_josue_id,
  'iPhone', '11', 'No enciende', 'listo',
  false, true, true, true, true, true,
  60.00, v_tasa_demo, now() - interval '1 day',
  7, NULL, NULL,
  now() - interval '3 days', now() - interval '1 day'),

-- 3. En reparación
(v_ord3, v_tenant_id, 3, v_suc_norte_id, v_cli3, v_tec_german_id,
  'Xiaomi', 'Redmi 9', 'Pantalla trozada', 'en_reparacion',
  true, false, true, true, true, true,
  25.00, NULL, NULL,
  7, NULL, NULL,
  now() - interval '2 days', now() - interval '2 days'),

-- 4. Aprobado
(v_ord4, v_tenant_id, 4, v_suc_central_id, v_cli4, v_tec_cesar_id,
  'Samsung', 'A50', 'Batería no carga', 'aprobado',
  true, true, true, false, true, true,
  18.00, NULL, NULL,
  7, NULL, NULL,
  now() - interval '1 day', now() - interval '1 day'),

-- 5. Cotizado
(v_ord5, v_tenant_id, 5, v_suc_norte_id, v_cli5, v_tec_josue_id,
  'iPhone', 'X', 'Pin de carga dañado', 'cotizado',
  true, true, true, false, true, true,
  20.00, NULL, NULL,
  7, NULL, NULL,
  now() - interval '12 hours', now() - interval '12 hours'),

-- 6. Diagnóstico
(v_ord6, v_tenant_id, 6, v_suc_central_id, v_cli6, v_tec_german_id,
  'Huawei', 'Y9 2019', 'Cámara no funciona', 'diagnostico',
  true, true, true, true, false, true,
  NULL, NULL, NULL,
  7, NULL, NULL,
  now() - interval '6 hours', now() - interval '6 hours'),

-- 7. Recibido
(v_ord7, v_tenant_id, 7, v_suc_norte_id, v_cli7, v_tec_cesar_id,
  'Samsung', 'A12', 'No carga', 'recibido',
  true, true, true, false, true, true,
  NULL, NULL, NULL,
  7, NULL, NULL,
  now() - interval '2 hours', now() - interval '2 hours'),

-- 8. Cancelado
(v_ord8, v_tenant_id, 8, v_suc_central_id, v_cli8, v_tec_josue_id,
  'Motorola', 'G32', 'Mojado', 'cancelado',
  false, false, false, false, false, false,
  NULL, NULL, NULL,
  7, NULL, NULL,
  now() - interval '4 days', now() - interval '3 days'),

-- 9. Entregada con ganancia real
(v_ord9, v_tenant_id, 9, v_suc_norte_id, v_cli9, v_tec_german_id,
  'iPhone', '12', 'Batería agotada rápido', 'entregado',
  true, true, true, true, true, true,
  28.00, v_tasa_demo, now() - interval '2 days',
  7, now() - interval '2 days', now() + interval '5 days',
  now() - interval '4 days', now() - interval '2 days'),

-- 10. Lista - garantía próxima a vencer (en 2 días)
(v_ord10, v_tenant_id, 10, v_suc_central_id, v_cli10, v_tec_cesar_id,
  'Samsung', 'A21s', 'Cámara trasera no enfoca', 'entregado',
  true, true, true, true, false, true,
  22.00, v_tasa_demo, now() - interval '5 days',
  7, now() - interval '5 days', now() + interval '2 days',
  now() - interval '6 days', now() - interval '5 days'),

-- 11. Equipo sin movimiento hace 35 días (alerta de abandono)
(v_ord11, v_tenant_id, 11, v_suc_norte_id, v_cli1, v_tec_josue_id,
  'Samsung', 'J7 Pro', 'Botón home dañado', 'diagnostico',
  true, true, true, true, true, false,
  NULL, NULL, NULL,
  7, NULL, NULL,
  now() - interval '35 days', now() - interval '35 days'),

-- 12. En reparación reciente
(v_ord12, v_tenant_id, 12, v_suc_central_id, v_cli3, v_tec_german_id,
  'iPhone', '11', 'Pantalla con líneas', 'en_reparacion',
  true, false, true, true, true, true,
  55.00, NULL, NULL,
  7, NULL, NULL,
  now() - interval '1 day', now() - interval '1 day');

-- =========================================
-- COSTOS DE ÓRDENES ENTREGADAS
-- =========================================
-- Orden 1: Samsung A25 - pantalla desde inventario
INSERT INTO costos_orden (tenant_id, orden_id, concepto, proveedor_id, inventario_id, costo_usd) VALUES
  (v_tenant_id, v_ord1, 'Pantalla Samsung A25', v_prov_central_id, v_inv_pant_a25, 18.00),
  (v_tenant_id, v_ord1, 'Mano de obra', NULL, NULL, 5.00);

-- Orden 9: iPhone 12 - batería
INSERT INTO costos_orden (tenant_id, orden_id, concepto, proveedor_id, inventario_id, costo_usd) VALUES
  (v_tenant_id, v_ord9, 'Batería iPhone 12', v_prov_braco_id, v_inv_bat_iph12, 15.00),
  (v_tenant_id, v_ord9, 'Mano de obra', NULL, NULL, 3.00);

-- Orden 10: Samsung A21s - cámara
INSERT INTO costos_orden (tenant_id, orden_id, concepto, proveedor_id, inventario_id, costo_usd) VALUES
  (v_tenant_id, v_ord10, 'Cámara trasera Samsung A21s', v_prov_babilon_id, v_inv_cam_a21s, 10.00),
  (v_tenant_id, v_ord10, 'Mano de obra', NULL, NULL, 3.00);

-- =========================================
-- HISTORIAL DE ESTADOS
-- =========================================
INSERT INTO ordenes_historial (tenant_id, orden_id, estado_anterior, estado_nuevo, created_at) VALUES
  (v_tenant_id, v_ord1, NULL, 'recibido', now() - interval '7 days'),
  (v_tenant_id, v_ord1, 'recibido', 'diagnostico', now() - interval '7 days'),
  (v_tenant_id, v_ord1, 'diagnostico', 'aprobado', now() - interval '6 days'),
  (v_tenant_id, v_ord1, 'aprobado', 'en_reparacion', now() - interval '6 days'),
  (v_tenant_id, v_ord1, 'en_reparacion', 'listo', now() - interval '5 days'),
  (v_tenant_id, v_ord1, 'listo', 'entregado', now() - interval '5 days'),
  (v_tenant_id, v_ord2, NULL, 'recibido', now() - interval '3 days'),
  (v_tenant_id, v_ord2, 'recibido', 'diagnostico', now() - interval '3 days'),
  (v_tenant_id, v_ord2, 'diagnostico', 'aprobado', now() - interval '2 days'),
  (v_tenant_id, v_ord2, 'aprobado', 'en_reparacion', now() - interval '2 days'),
  (v_tenant_id, v_ord2, 'en_reparacion', 'listo', now() - interval '1 day');

-- =========================================
-- PLANTILLAS WHATSAPP DEFAULT
-- =========================================
INSERT INTO plantillas_whatsapp (tenant_id, evento, mensaje, activo) VALUES
  (v_tenant_id, 'orden_recibida',
   '¡Hola {cliente}! 👋 Tu equipo *{modelo}* ha sido recibido en *{taller}*. Orden N° {numero_orden}. En breve te contactamos con el diagnóstico. ¡Gracias por confiar en nosotros!',
   true),
  (v_tenant_id, 'listo_retirar',
   '¡Buenas noticias, {cliente}! 🎉 Tu *{modelo}* (Orden N° {numero_orden}) ya está listo para retirar en *{taller}*. El costo de la reparación es *${precio} USD*. ¡Te esperamos!',
   true),
  (v_tenant_id, 'entregado',
   'Gracias por visitarnos, {cliente}. Tu *{modelo}* fue entregado. Recuerda que tiene garantía de 7 días en la falla reparada. Cualquier consulta, escríbenos. - *{taller}*',
   true),
  (v_tenant_id, 'presupuesto_listo',
   'Hola {cliente}, el presupuesto para tu *{modelo}* (Orden N° {numero_orden}) está listo. El costo estimado es *${precio} USD*. Responde SI para aprobar o NO para cancelar. - *{taller}*',
   true);

-- =========================================
-- TASA BCV DEMO (última semana)
-- =========================================
INSERT INTO tasas_bcv (fecha, tasa, fuente) VALUES
  (CURRENT_DATE, 475.9580, 'api'),
  (CURRENT_DATE - 1, 475.2340, 'api'),
  (CURRENT_DATE - 2, 474.8910, 'api'),
  (CURRENT_DATE - 3, 474.5670, 'api'),
  (CURRENT_DATE - 4, 474.1230, 'api'),
  (CURRENT_DATE - 5, 473.7890, 'api'),
  (CURRENT_DATE - 6, 473.4560, 'api')
ON CONFLICT (fecha) DO NOTHING;

END $$;
