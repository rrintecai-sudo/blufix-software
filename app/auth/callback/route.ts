// Este endpoint ya no se usa — Clerk maneja el callback OAuth.
// Se mantiene para no romper rutas legacy.
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
}
