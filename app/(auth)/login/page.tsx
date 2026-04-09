import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">B</span>
          </div>
          <span className="font-display font-bold text-2xl text-foreground">BluFix</span>
        </div>
        <p className="text-muted-foreground text-sm">Sistema de Gestión de Talleres</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full max-w-sm',
            card: 'bg-card border border-border shadow-xl rounded-xl',
            headerTitle: 'text-foreground font-display',
            headerSubtitle: 'text-muted-foreground',
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
            formFieldInput: 'bg-background border-input text-foreground',
            formFieldLabel: 'text-foreground',
            footerActionLink: 'text-primary',
          },
        }}
      />
    </div>
  )
}
