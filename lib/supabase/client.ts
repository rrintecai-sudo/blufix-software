import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente browser con anon key — solo para lecturas seguras vía API routes.
// Las mutaciones deben ir a través de Server Actions.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
