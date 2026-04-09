import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente servidor con service_role key — bypasa RLS.
// Toda llamada debe filtrar explícitamente por tenant_id obtenido de Clerk auth().
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
