'use client'

import type { Usuario } from '@/lib/types'

export function ConfigUsuarios({ usuarios }: { usuarios: Usuario[] }) {
  return (
    <section className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="font-display font-semibold text-foreground">Usuarios del taller</h2>
      <div className="divide-y divide-border">
        {usuarios.map((u) => (
          <div key={u.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">{u.nombre}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full capitalize">{u.rol}</span>
              <span className={`text-xs ${u.activo ? 'text-green-400' : 'text-red-400'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
        ))}
        {usuarios.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Sin usuarios</p>}
      </div>
      <p className="text-xs text-muted-foreground">Los usuarios se crean desde el panel de administración de Supabase Auth.</p>
    </section>
  )
}
