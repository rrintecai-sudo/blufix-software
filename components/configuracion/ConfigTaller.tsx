'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { actualizarTenant } from '@/app/actions/db'
import { toast } from 'sonner'
import type { Tenant } from '@/lib/types'

interface Props {
  tenant: Tenant | null
}

export function ConfigTaller({ tenant }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    nombre: tenant?.nombre ?? '',
    telefono: tenant?.telefono ?? '',
    email: tenant?.email ?? '',
    direccion: tenant?.direccion ?? '',
    ciudad: tenant?.ciudad ?? '',
    rif: tenant?.rif ?? '',
    color_primario: tenant?.color_primario ?? '#2563EB',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const guardar = () => {
    if (!tenant) return
    startTransition(async () => {
      try {
        await actualizarTenant(form)
        toast.success('Datos del taller actualizados')
        router.refresh()
      } catch {
        toast.error('Error al guardar')
      }
    })
  }

  return (
    <section className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="font-display font-semibold text-foreground">Datos del taller</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-sm font-medium text-foreground">Nombre del taller *</label>
          <input value={form.nombre} onChange={set('nombre')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <Field label="Teléfono" value={form.telefono} onChange={set('telefono')} />
        <Field label="Email" value={form.email} onChange={set('email')} type="email" />
        <div className="col-span-2">
          <label className="text-sm font-medium text-foreground">Dirección</label>
          <input value={form.direccion} onChange={set('direccion')} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <Field label="Ciudad" value={form.ciudad} onChange={set('ciudad')} />
        <Field label="RIF" value={form.rif} onChange={set('rif')} placeholder="J-12345678-9" />
        <div>
          <label className="text-sm font-medium text-foreground">Color primario</label>
          <div className="flex items-center gap-2 mt-1">
            <input type="color" value={form.color_primario} onChange={set('color_primario')} className="w-10 h-10 rounded cursor-pointer border border-input" />
            <input value={form.color_primario} onChange={set('color_primario')} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>
      <button onClick={guardar} disabled={isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </section>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  )
}
