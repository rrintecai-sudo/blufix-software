'use client'

import { useActionState } from 'react'
import { demoSignIn } from '@/app/actions/demo-auth'
import Link from 'next/link'

export default function DemoLoginPage() {
  const [state, action, isPending] = useActionState(demoSignIn, null)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl font-display">B</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">BluFix Demo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Explora el sistema con datos de ejemplo reales
          </p>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-center space-y-1">
          <p className="text-foreground font-medium">Credenciales de acceso</p>
          <p className="text-muted-foreground">
            <span className="text-foreground">Email:</span> demo@blufix.pro
          </p>
          <p className="text-muted-foreground">
            <span className="text-foreground">Contraseña:</span> BluFix2026!
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Email</label>
            <input
              name="email"
              type="email"
              defaultValue="demo@blufix.pro"
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              defaultValue="BluFix2026!"
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-400 text-center">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Entrando...' : 'Entrar al demo →'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
