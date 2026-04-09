'use client'

import { UserButton } from '@clerk/nextjs'
import { getInitials } from '@/lib/utils'
import type { Usuario } from '@/lib/types'

interface UserMenuProps {
  usuario: Usuario | null
}

export function UserMenu({ usuario }: UserMenuProps) {
  if (!usuario) return null

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium text-foreground leading-none">{usuario.nombre}</p>
        <p className="text-xs text-muted-foreground capitalize">{usuario.rol}</p>
      </div>
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
            userButtonPopoverCard: 'bg-card border border-border',
            userButtonPopoverActionButton: 'text-foreground hover:bg-accent',
            userButtonPopoverFooter: 'hidden',
          },
        }}
      />
    </div>
  )
}
