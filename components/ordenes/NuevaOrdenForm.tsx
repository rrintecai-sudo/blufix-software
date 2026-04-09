'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { crearOrden, crearCliente } from '@/app/actions/db'
import { toast } from 'sonner'

interface Props {
  clientes: { id: string; nombre: string; telefono: string; cedula: string | null }[]
  tecnicos: { id: string; nombre: string }[]
  sucursales: { id: string; nombre: string }[]
}

const CHECKLIST_FIELDS = [
  { key: 'enciende', label: 'Enciende' },
  { key: 'pantalla_ok', label: 'Pantalla OK' },
  { key: 'corneta_ok', label: 'Corneta OK' },
  { key: 'pin_carga_ok', label: 'Pin de carga OK' },
  { key: 'camara_ok', label: 'Cámara OK' },
  { key: 'botones_ok', label: 'Botones OK' },
] as const

export function NuevaOrdenForm({ clientes, tecnicos, sucursales }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [clienteSearch, setClienteSearch] = useState('')
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false)

  const [form, setForm] = useState({
    cliente_id: '',
    sucursal_id: sucursales[0]?.id ?? '',
    tecnico_id: tecnicos[0]?.id ?? '',
    marca: '',
    modelo: '',
    imei: '',
    color: '',
    falla_reportada: '',
    hora_prometida: '',
    notas_estado: '',
    enciende: null as boolean | null,
    pantalla_ok: null as boolean | null,
    corneta_ok: null as boolean | null,
    pin_carga_ok: null as boolean | null,
    camara_ok: null as boolean | null,
    botones_ok: null as boolean | null,
  })

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    cedula: '',
    email: '',
  })

  const clientesFiltrados = clientes.filter((c) =>
    clienteSearch
      ? c.nombre.toLowerCase().includes(clienteSearch.toLowerCase()) ||
        c.telefono.includes(clienteSearch) ||
        (c.cedula ?? '').includes(clienteSearch)
      : true
  ).slice(0, 8)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cliente_id && !mostrarNuevoCliente) {
      toast.error('Selecciona o crea un cliente')
      return
    }
    if (!form.marca || !form.modelo || !form.falla_reportada) {
      toast.error('Completa los datos del equipo')
      return
    }

    startTransition(async () => {
      try {
        let clienteId = form.cliente_id

        if (mostrarNuevoCliente) {
          if (!nuevoCliente.nombre || !nuevoCliente.telefono) {
            toast.error('Nombre y teléfono del cliente son obligatorios')
            return
          }
          const cli = await crearCliente({
            nombre: nuevoCliente.nombre,
            telefono: nuevoCliente.telefono || null,
            cedula: nuevoCliente.cedula || null,
            email: nuevoCliente.email || null,
            notas: null,
          })
          clienteId = cli.id
        }

        const orden = await crearOrden({
          cliente_id: clienteId || null,
          sucursal_id: form.sucursal_id || null,
          tecnico_id: form.tecnico_id || null,
          marca: form.marca,
          modelo: form.modelo,
          imei: form.imei || null,
          color: form.color || null,
          falla_reportada: form.falla_reportada,
          diagnostico: null,
          enciende: form.enciende ?? false,
          pantalla_ok: form.pantalla_ok ?? false,
          corneta_ok: form.corneta_ok ?? false,
          pin_carga_ok: form.pin_carga_ok ?? false,
          camara_ok: form.camara_ok ?? false,
          botones_ok: form.botones_ok ?? false,
          notas_estado: form.notas_estado || null,
          hora_prometida: form.hora_prometida || null,
          precio_inicial_usd: null,
        })

        toast.success(`Orden #${orden.numero_orden} creada`)
        router.push(`/ordenes/${orden.id}`)
      } catch (err: any) {
        toast.error('Error al crear la orden: ' + err.message)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cliente */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-foreground">Cliente</h2>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMostrarNuevoCliente(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!mostrarNuevoCliente ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}
          >
            Buscar existente
          </button>
          <button
            type="button"
            onClick={() => setMostrarNuevoCliente(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mostrarNuevoCliente ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}
          >
            Nuevo cliente
          </button>
        </div>

        {!mostrarNuevoCliente ? (
          <div className="space-y-2">
            <input
              placeholder="Buscar por nombre, teléfono o cédula..."
              value={clienteSearch}
              onChange={(e) => setClienteSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {clienteSearch && (
              <div className="border border-border rounded-lg overflow-hidden">
                {clientesFiltrados.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Sin resultados</p>
                ) : (
                  clientesFiltrados.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, cliente_id: c.id }))
                        setClienteSearch(c.nombre)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${form.cliente_id === c.id ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
                    >
                      <span className="font-medium">{c.nombre}</span>
                      <span className="text-muted-foreground ml-2">{c.telefono}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nombre *" value={nuevoCliente.nombre} onChange={(v) => setNuevoCliente((p) => ({ ...p, nombre: v }))} />
            <FormField label="Teléfono *" value={nuevoCliente.telefono} onChange={(v) => setNuevoCliente((p) => ({ ...p, telefono: v }))} placeholder="0412-1234567" />
            <FormField label="Cédula" value={nuevoCliente.cedula} onChange={(v) => setNuevoCliente((p) => ({ ...p, cedula: v }))} placeholder="V-12.345.678" />
            <FormField label="Email" value={nuevoCliente.email} onChange={(v) => setNuevoCliente((p) => ({ ...p, email: v }))} type="email" />
          </div>
        )}
      </section>

      {/* Equipo */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-foreground">Equipo</h2>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Marca *" value={form.marca} onChange={(v) => setForm((f) => ({ ...f, marca: v }))} placeholder="Samsung, iPhone..." />
          <FormField label="Modelo *" value={form.modelo} onChange={(v) => setForm((f) => ({ ...f, modelo: v }))} placeholder="A25, 14 Pro..." />
          <FormField label="IMEI" value={form.imei} onChange={(v) => setForm((f) => ({ ...f, imei: v }))} placeholder="15 dígitos" />
          <FormField label="Color" value={form.color} onChange={(v) => setForm((f) => ({ ...f, color: v }))} placeholder="Negro, Blanco..." />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Falla reportada *</label>
          <textarea
            value={form.falla_reportada}
            onChange={(e) => setForm((f) => ({ ...f, falla_reportada: e.target.value }))}
            required
            rows={2}
            placeholder="Describe la falla que reporta el cliente..."
            className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
      </section>

      {/* Checklist */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-foreground">Estado del equipo al recibir</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CHECKLIST_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-foreground flex-1">{label}</span>
              <div className="flex gap-1.5">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, [key]: val }))}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      form[key] === val
                        ? val ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-secondary text-muted-foreground border border-border'
                    }`}
                  >
                    {val ? 'Sí' : 'No'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Notas del estado</label>
          <input
            value={form.notas_estado}
            onChange={(e) => setForm((f) => ({ ...f, notas_estado: e.target.value }))}
            placeholder="Rayones, grietas, accesorios incluidos..."
            className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </section>

      {/* Asignación */}
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-foreground">Asignación</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground">Técnico</label>
            <select
              value={form.tecnico_id}
              onChange={(e) => setForm((f) => ({ ...f, tecnico_id: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Sin asignar</option>
              {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Sucursal</label>
            <select
              value={form.sucursal_id}
              onChange={(e) => setForm((f) => ({ ...f, sucursal_id: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Hora prometida</label>
            <input
              type="datetime-local"
              value={form.hora_prometida}
              onChange={(e) => setForm((f) => ({ ...f, hora_prometida: e.target.value }))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Creando orden...' : 'Crear orden'}
      </button>
    </form>
  )
}

function FormField({
  label, value, onChange, placeholder, type = 'text'
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  )
}
