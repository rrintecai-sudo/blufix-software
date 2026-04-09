'use client'

import { demoSignOut } from '@/app/actions/demo-auth'

export function DemoBanner() {
  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-sm">
      <span className="text-amber-400 font-medium">
        Estás en el modo demo de BluFix — los datos son de ejemplo
      </span>
      <form action={demoSignOut}>
        <button
          type="submit"
          className="text-amber-400 hover:text-amber-300 underline text-xs transition-colors"
        >
          Salir del demo
        </button>
      </form>
    </div>
  )
}
