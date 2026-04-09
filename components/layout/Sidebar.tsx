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
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-bold text-foreground text-lg">BluFix</span>
        </div>
      </div>

      {/* Nav */}
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

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground/60 text-center">BluFix v1.0</p>
      </div>
    </aside>
  )
}
