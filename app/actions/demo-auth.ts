'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const DEMO_TENANT_ID = 'f228900b-a449-4bd7-9963-f50187d14a18'

export async function demoSignIn(_: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos' }
  }

  const cookieStore = await cookies()
  cookieStore.set('demo_session', DEMO_TENANT_ID, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  redirect('/dashboard')
}

export async function demoSignOut() {
  const cookieStore = await cookies()
  cookieStore.delete('demo_session')
  redirect('/')
}
