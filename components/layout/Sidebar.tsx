'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  Wrench,
  FileText,
  DollarSign,
  MessageCircle,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/ordenes',       label: 'Órdenes',       icon: ClipboardList },
  { href: '/inventario',    label: 'Inventario',    icon: Package },
  { href: '/clientes',      label: 'Clientes',      icon: Users },
  { href: '/tecnicos',      label: 'Técnicos',      icon: Wrench },
  { href: '/presupuestos',  label: 'Presupuestos',  icon: FileText },
  { href: '/caja',          label: 'Caja',          icon: DollarSign },
  { href: '/whatsapp',      label: 'WhatsApp',      icon: MessageCircle },
  { href: '/configuracion', label: 'Config',        icon: Settings },
]

// Top 5 items shown in mobile bottom nav
const MOBILE_NAV = NAV_ITEMS.slice(0, 5)

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-card border-r border-border flex-col h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-display font-bold text-sm">B</span>
            </div>
            <span className="font-display font-bold text-foreground text-lg">BluFix</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground/60 text-center">BluFix v1.0</p>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="grid grid-cols-5 h-16">
          {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
