import { NextResponse } from 'next/server'
import { forzarActualizacionTasa } from '@/lib/tasa-bcv'

export async function POST() {
  const result = await forzarActualizacionTasa()
  if (!result) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }
  return NextResponse.json(result)
}
