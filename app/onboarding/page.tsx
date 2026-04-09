import { UserButton } from '@clerk/nextjs'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <span className="text-primary font-display font-bold text-3xl">B</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">
            Cuenta pendiente de activación
          </h1>
          <p className="text-muted-foreground text-sm">
            Tu cuenta en BluFix aún no ha sido activada por el administrador.
            Contacta a tu administrador para que te asigne a un taller.
          </p>
        </div>
        <div className="pt-2">
          <UserButton />
        </div>
      </div>
    </div>
  )
}
