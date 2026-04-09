import { createClient } from '@/lib/supabase/server'
import type { TasaBCV } from '@/lib/types'

// Obtener la tasa BCV más reciente
export async function getTasaBCVActual(): Promise<TasaBCV | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasas_bcv')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data
}

// Verificar si la tasa está desactualizada (más de 6 horas)
export function tasaEstaDesactualizada(tasa: TasaBCV | null): boolean {
  if (!tasa) return true
  const ahora = new Date()
  const fechaTasa = new Date(tasa.created_at)
  const diferenciaHoras = (ahora.getTime() - fechaTasa.getTime()) / (1000 * 60 * 60)
  return diferenciaHoras > 6
}

// Forzar actualización de tasa (llama a la Edge Function)
export async function forzarActualizacionTasa(): Promise<{ tasa: number; fecha: string } | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-tasa-bcv`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}
