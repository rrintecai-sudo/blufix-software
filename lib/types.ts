// =============================================
// BLUFIX - Tipos TypeScript centrales
// =============================================

export type Tenant = {
  id: string
  nombre: string
  slug: string
  logo_url: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  ciudad: string | null
  pais: string
  rif: string | null
  color_primario: string
  activo: boolean
  plan: 'demo' | 'pro' | 'enterprise'
  fecha_vencimiento: string | null
  created_at: string
}

export type RolUsuario = 'admin' | 'supervisor' | 'tecnico' | 'caja'

export type Usuario = {
  id: string
  tenant_id: string
  nombre: string
  email: string
  rol: RolUsuario
  activo: boolean
  created_at: string
}

export type EstadoOrden =
  | 'recibido'
  | 'diagnostico'
  | 'cotizado'
  | 'aprobado'
  | 'en_reparacion'
  | 'listo'
  | 'entregado'
  | 'cancelado'

export type Tecnico = {
  id: string
  tenant_id: string
  nombre: string
  cedula: string | null
  telefono: string | null
  fecha_ingreso: string | null
  porcentaje_comision: number
  metodo_pago: string | null
  datos_pago: string | null
  activo: boolean
  created_at: string
}

export type Cliente = {
  id: string
  tenant_id: string
  nombre: string
  cedula: string | null
  telefono: string
  email: string | null
  direccion: string | null
  historial_ordenes: number
  created_at: string
}

export type Proveedor = {
  id: string
  tenant_id: string
  nombre: string
  costo_cero: boolean
  telefono: string | null
  notas: string | null
  activo: boolean
  created_at: string
}

export type Sucursal = {
  id: string
  tenant_id: string
  nombre: string
  direccion: string | null
  telefono: string | null
  activo: boolean
  created_at: string
}

export type CategoriaInventario =
  | 'pantalla'
  | 'bateria'
  | 'flex'
  | 'conector'
  | 'camara'
  | 'botones'
  | 'carcasa'
  | 'otro'

export type InventarioItem = {
  id: string
  tenant_id: string
  sucursal_id: string | null
  nombre: string
  referencia: string | null
  categoria: CategoriaInventario
  marca: string | null
  modelo_compatible: string | null
  proveedor_id: string | null
  stock_actual: number
  stock_minimo: number
  costo_usd: number
  precio_venta_usd: number
  created_at: string
  updated_at: string
}

export type InventarioMovimiento = {
  id: string
  tenant_id: string
  inventario_id: string
  orden_id: string | null
  tipo: 'entrada' | 'salida' | 'ajuste'
  cantidad: number
  costo_usd: number | null
  tasa_bcv: number | null
  notas: string | null
  usuario_id: string | null
  created_at: string
}

export type Orden = {
  id: string
  tenant_id: string
  numero_orden: number
  sucursal_id: string | null
  cliente_id: string | null
  tecnico_id: string | null

  // Equipo
  marca: string
  modelo: string
  imei: string | null
  color: string | null
  falla_reportada: string
  diagnostico: string | null

  // Checklist
  enciende: boolean | null
  pantalla_ok: boolean | null
  corneta_ok: boolean | null
  pin_carga_ok: boolean | null
  camara_ok: boolean | null
  botones_ok: boolean | null
  notas_estado: string | null

  estado: EstadoOrden

  // Facturación inicial
  precio_inicial_usd: number | null
  tasa_inicial: number | null
  fecha_inicial: string | null

  // Facturación final
  precio_cobrado_usd: number | null
  tasa_evento: number | null
  fecha_facturacion: string | null
  motivo_ajuste_precio: string | null
  numero_factura: string | null
  metodo_pago: string | null

  // Garantía
  garantia_dias: number
  fecha_entrega: string | null
  garantia_vence: string | null
  hora_prometida: string | null

  created_at: string
  updated_at: string
}

export type OrdenResumen = Orden & {
  tenant_nombre: string
  cliente_nombre: string
  cliente_telefono: string
  tecnico_nombre: string
  porcentaje_comision: number
  sucursal_nombre: string
  costo_total_usd: number
  ganancia_usd: number
  comision_tecnico_usd: number
  precio_cobrado_bs: number
  costo_total_bs: number
  ganancia_bs: number
  comision_tecnico_bs: number
}

export type CostoOrden = {
  id: string
  tenant_id: string
  orden_id: string
  concepto: string
  proveedor_id: string | null
  inventario_id: string | null
  costo_usd: number
  notas: string | null
  created_at: string
}

export type OrdenHistorial = {
  id: string
  tenant_id: string
  orden_id: string
  estado_anterior: EstadoOrden | null
  estado_nuevo: EstadoOrden
  notas: string | null
  usuario_id: string | null
  created_at: string
}

export type PresupuestoItem = {
  concepto: string
  costo_usd: number
}

export type Presupuesto = {
  id: string
  tenant_id: string
  orden_id: string
  numero_presupuesto: number
  descripcion_trabajo: string
  items: PresupuestoItem[]
  total_usd: number | null
  tasa_bcv: number | null
  total_bs: number | null
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  fecha_vencimiento: string | null
  notas: string | null
  created_at: string
}

export type Liquidacion = {
  id: string
  tenant_id: string
  tecnico_id: string | null
  tecnico_nombre: string
  sucursal_id: string | null
  periodo_desde: string
  periodo_hasta: string
  total_comision_usd: number | null
  tasa_pago: number | null
  total_pagar_bs: number | null
  estado: 'pendiente' | 'pagado'
  fecha_pago: string | null
  notas: string | null
  created_at: string
}

export type CajaMovimiento = {
  id: string
  tenant_id: string
  sucursal_id: string | null
  fecha: string
  tipo: 'ingreso' | 'egreso'
  categoria: 'reparacion' | 'venta_repuesto' | 'gasto_operativo' | 'otro' | null
  concepto: string
  monto_usd: number | null
  monto_bs: number | null
  tasa_bcv: number | null
  orden_id: string | null
  metodo_pago: string | null
  usuario_id: string | null
  created_at: string
}

export type TasaBCV = {
  id: string
  fecha: string
  tasa: number
  fuente: 'api' | 'manual'
  created_at: string
}

export type PlantillaWhatsapp = {
  id: string
  tenant_id: string
  evento: 'orden_recibida' | 'listo_retirar' | 'entregado' | 'presupuesto_listo'
  mensaje: string
  activo: boolean
}

export type NotificacionWhatsapp = {
  id: string
  tenant_id: string
  orden_id: string | null
  cliente_telefono: string | null
  mensaje: string | null
  estado: 'pendiente' | 'enviado' | 'error'
  enviado_at: string | null
  created_at: string
}

// =============================================
// Tipos de contexto de la app
// =============================================

export type TenantContext = {
  tenant: Tenant
  usuario: Usuario
}

// Configuración de colores por estado de orden
export const ESTADO_ORDEN_CONFIG: Record<EstadoOrden, { label: string; color: string; bg: string }> = {
  recibido:     { label: 'Recibido',      color: 'text-gray-400',   bg: 'bg-gray-500/20' },
  diagnostico:  { label: 'Diagnóstico',   color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  cotizado:     { label: 'Cotizado',      color: 'text-orange-400', bg: 'bg-orange-500/20' },
  aprobado:     { label: 'Aprobado',      color: 'text-blue-400',   bg: 'bg-blue-500/20' },
  en_reparacion:{ label: 'En Reparación', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  listo:        { label: 'Listo',         color: 'text-green-400',  bg: 'bg-green-500/20' },
  entregado:    { label: 'Entregado',     color: 'text-slate-400',  bg: 'bg-slate-500/20' },
  cancelado:    { label: 'Cancelado',     color: 'text-red-400',    bg: 'bg-red-500/20' },
}

export const ESTADOS_ORDEN_FLOW: EstadoOrden[] = [
  'recibido', 'diagnostico', 'cotizado', 'aprobado', 'en_reparacion', 'listo', 'entregado'
]
