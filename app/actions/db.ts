'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

// Helper: obtener tenant_id del usuario autenticado
export async function getAuthContext() {
  const { userId } = await auth()
  if (!userId) throw new Error('No autenticado')

  const supabase = createClient()
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('tenant_id, rol, activo')
    .eq('id', userId)
    .single()

  if (!usuario) throw new Error('Usuario no encontrado')
  return { supabase, tenantId: usuario.tenant_id as string, userId, rol: usuario.rol }
}

// ============================================================
// COSTOS DE ORDEN
// ============================================================

export async function agregarCostoOrden(ordenId: string, data: {
  concepto: string
  proveedor_id: string | null
  inventario_id: string | null
  costo_usd: number
}) {
  const { supabase, tenantId } = await getAuthContext()

  const { data: costo, error } = await supabase
    .from('costos_orden')
    .insert({ ...data, orden_id: ordenId, tenant_id: tenantId })
    .select('*, proveedores(nombre), inventario(nombre)')
    .single()

  if (error) throw new Error(error.message)
  return costo
}

export async function eliminarCostoOrden(costoId: string) {
  const { supabase, tenantId } = await getAuthContext()
  const { error } = await supabase
    .from('costos_orden')
    .delete()
    .eq('id', costoId)
    .eq('tenant_id', tenantId)

  if (error) throw new Error(error.message)
}

// ============================================================
// FACTURACIÓN
// ============================================================

export async function guardarFacturacion(ordenId: string, data: {
  precio_cobrado_usd: number
  metodo_pago: string | null
  numero_factura: string | null
  motivo_ajuste_precio: string | null
}) {
  const { supabase, tenantId } = await getAuthContext()

  // Obtener tasa actual
  const { data: tasaData } = await supabase
    .from('tasas_bcv')
    .select('tasa')
    .order('fecha', { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from('ordenes')
    .update({
      ...data,
      tasa_evento: tasaData?.tasa ?? null,
      fecha_facturacion: new Date().toISOString(),
    })
    .eq('id', ordenId)
    .eq('tenant_id', tenantId)

  if (error) throw new Error(error.message)
}

// ============================================================
// CAMBIO DE ESTADO
// ============================================================

export async function cambiarEstadoOrden(ordenId: string, nuevoEstado: string, estadoAnterior: string, extra?: {
  garantia_dias?: number
  fecha_entrega?: string
  garantia_vence?: string
}) {
  const { supabase, tenantId } = await getAuthContext()

  const updateData: any = { estado: nuevoEstado }
  if (extra) Object.assign(updateData, extra)

  const { error: updateError } = await supabase
    .from('ordenes')
    .update(updateData)
    .eq('id', ordenId)
    .eq('tenant_id', tenantId)

  if (updateError) throw new Error(updateError.message)

  await supabase.from('ordenes_historial').insert({
    tenant_id: tenantId,
    orden_id: ordenId,
    estado_anterior: estadoAnterior,
    estado_nuevo: nuevoEstado,
  })
}

// ============================================================
// WHATSAPP LOG
// ============================================================

export async function registrarNotificacionWhatsapp(data: {
  orden_id: string
  evento: string
  mensaje_enviado: string
  telefono_destino: string
}) {
  const { supabase, tenantId } = await getAuthContext()

  await supabase.from('notificaciones_whatsapp').insert({
    ...data,
    tenant_id: tenantId,
  })
}

// ============================================================
// NUEVA ORDEN
// ============================================================

export async function crearOrden(data: {
  sucursal_id: string | null
  cliente_id: string | null
  tecnico_id: string | null
  marca: string
  modelo: string
  imei: string | null
  color: string | null
  falla_reportada: string
  diagnostico: string | null
  enciende: boolean
  pantalla_ok: boolean
  corneta_ok: boolean
  pin_carga_ok: boolean
  camara_ok: boolean
  botones_ok: boolean
  notas_estado: string | null
  hora_prometida: string | null
  precio_inicial_usd: number | null
}) {
  const { supabase, tenantId } = await getAuthContext()

  // Obtener número de orden correlativo
  const { data: numeroData, error: rpcError } = await supabase
    .rpc('generar_numero_orden', { p_tenant_id: tenantId })

  if (rpcError) throw new Error(rpcError.message)

  const { data: orden, error } = await supabase
    .from('ordenes')
    .insert({
      ...data,
      tenant_id: tenantId,
      numero_orden: numeroData,
      estado: 'recibido',
    })
    .select('id, numero_orden')
    .single()

  if (error) throw new Error(error.message)
  return orden
}

// ============================================================
// CLIENTES
// ============================================================

export async function crearCliente(data: {
  nombre: string
  cedula: string | null
  telefono: string | null
  email: string | null
  notas: string | null
}) {
  const { supabase, tenantId } = await getAuthContext()

  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({ ...data, tenant_id: tenantId })
    .select('id, nombre, cedula, telefono, email')
    .single()

  if (error) throw new Error(error.message)
  return cliente
}

export async function buscarClientes(q: string) {
  const { supabase, tenantId } = await getAuthContext()

  const { data } = await supabase
    .from('clientes')
    .select('id, nombre, cedula, telefono')
    .eq('tenant_id', tenantId)
    .or(`nombre.ilike.%${q}%,cedula.ilike.%${q}%,telefono.ilike.%${q}%`)
    .limit(10)

  return data ?? []
}

// ============================================================
// INVENTARIO
// ============================================================

export async function agregarPieza(data: {
  nombre: string
  referencia: string | null
  categoria: string | null
  marca: string | null
  modelo_compatible: string | null
  proveedor_id: string | null
  sucursal_id: string | null
  stock_actual: number
  stock_minimo: number
  costo_usd: number
  precio_venta_usd: number
}) {
  const { supabase, tenantId } = await getAuthContext()

  const { error } = await supabase
    .from('inventario')
    .insert({ ...data, tenant_id: tenantId })

  if (error) throw new Error(error.message)
}

export async function registrarMovimientoInventario(data: {
  inventario_id: string
  tipo: string
  cantidad: number
  costo_usd: number | null
  notas: string | null
}) {
  const { supabase, tenantId, userId } = await getAuthContext()

  const { data: tasaData } = await supabase
    .from('tasas_bcv')
    .select('tasa')
    .order('fecha', { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from('inventario_movimientos')
    .insert({
      ...data,
      tenant_id: tenantId,
      usuario_id: userId,
      tasa_bcv: tasaData?.tasa ?? null,
    })

  if (error) throw new Error(error.message)

  // Actualizar stock
  const delta = data.tipo === 'salida' ? -data.cantidad : data.cantidad
  await supabase.rpc('adjust_stock', {
    p_inventario_id: data.inventario_id,
    p_delta: delta,
  }).throwOnError()
}

// ============================================================
// CAJA
// ============================================================

export async function agregarMovimientoCaja(data: {
  sucursal_id: string | null
  tipo: string
  categoria: string | null
  descripcion: string
  monto_usd: number
  tasa_bcv: number | null
  metodo_pago: string | null
  orden_id: string | null
}) {
  const { supabase, tenantId, userId } = await getAuthContext()

  const { data: tasaData } = await supabase
    .from('tasas_bcv')
    .select('tasa')
    .order('fecha', { ascending: false })
    .limit(1)
    .single()

  const { descripcion, ...rest } = data
  const { error } = await supabase
    .from('caja')
    .insert({
      ...rest,
      concepto: descripcion,
      tenant_id: tenantId,
      usuario_id: userId,
      fecha: new Date().toISOString().split('T')[0],
      tasa_bcv: data.tasa_bcv ?? tasaData?.tasa ?? null,
    })

  if (error) throw new Error(error.message)
}

// ============================================================
// LIQUIDACIONES
// ============================================================

export async function crearLiquidacion(data: {
  tecnico_id: string
  fecha_inicio: string
  fecha_fin: string
  total_ordenes: number
  total_ingresos_usd: number
  total_comision_usd: number
  tasa_pago: number
  total_comision_bs: number
  notas: string | null
}) {
  const { supabase, tenantId } = await getAuthContext()

  const { error } = await supabase
    .from('liquidaciones')
    .insert({ ...data, tenant_id: tenantId })

  if (error) throw new Error(error.message)
}

// ============================================================
// PLANTILLAS WHATSAPP
// ============================================================

export async function actualizarPlantillaWhatsapp(plantillaId: string, mensaje: string) {
  const { supabase, tenantId } = await getAuthContext()

  const { error } = await supabase
    .from('plantillas_whatsapp')
    .update({ mensaje })
    .eq('id', plantillaId)
    .eq('tenant_id', tenantId)

  if (error) throw new Error(error.message)
}

// ============================================================
// CONFIGURACIÓN
// ============================================================

export async function actualizarTenant(data: Partial<{
  nombre: string
  telefono: string
  email: string
  direccion: string
  ciudad: string
  rif: string
  logo_url: string
}>) {
  const { supabase, tenantId } = await getAuthContext()

  const { error } = await supabase
    .from('tenants')
    .update(data)
    .eq('id', tenantId)

  if (error) throw new Error(error.message)
}

export async function crearSucursal(data: {
  nombre: string
  direccion: string | null
  telefono: string | null
}) {
  const { supabase, tenantId } = await getAuthContext()

  const { error } = await supabase
    .from('sucursales')
    .insert({ ...data, tenant_id: tenantId })

  if (error) throw new Error(error.message)
}

export async function toggleSucursal(sucursalId: string, activo: boolean) {
  const { supabase, tenantId } = await getAuthContext()
  await supabase.from('sucursales').update({ activo }).eq('id', sucursalId).eq('tenant_id', tenantId)
}

export async function crearTecnico(data: {
  nombre: string
  cedula: string | null
  telefono: string | null
  porcentaje_comision: number
  metodo_pago: string | null
}) {
  const { supabase, tenantId } = await getAuthContext()

  const { error } = await supabase
    .from('tecnicos')
    .insert({ ...data, tenant_id: tenantId })

  if (error) throw new Error(error.message)
}

export async function toggleTecnico(tecnicoId: string, activo: boolean) {
  const { supabase, tenantId } = await getAuthContext()
  await supabase.from('tecnicos').update({ activo }).eq('id', tecnicoId).eq('tenant_id', tenantId)
}

export async function crearProveedor(data: {
  nombre: string
  costo_cero: boolean
}) {
  const { supabase, tenantId } = await getAuthContext()

  const { error } = await supabase
    .from('proveedores')
    .insert({ ...data, tenant_id: tenantId })

  if (error) throw new Error(error.message)
}
