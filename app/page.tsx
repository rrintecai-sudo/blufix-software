import Link from 'next/link'
import { CheckCircle2, BarChart3, Wrench, Users, MessageCircle, Package } from 'lucide-react'

const features = [
  { icon: Wrench, title: 'Órdenes de reparación', desc: 'Gestiona el flujo completo de cada equipo recibido' },
  { icon: BarChart3, title: 'Reportes financieros', desc: 'Ganancias, costos y comisiones en tiempo real' },
  { icon: Users, title: 'Gestión de técnicos', desc: 'Asignación y liquidación de comisiones automática' },
  { icon: MessageCircle, title: 'WhatsApp integrado', desc: 'Notifica a tus clientes con un clic' },
  { icon: Package, title: 'Control de inventario', desc: 'Piezas y repuestos siempre bajo control' },
  { icon: CheckCircle2, title: 'Multi-sucursal', desc: 'Maneja varias tiendas desde un solo lugar' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-display">B</span>
          </div>
          <span className="font-display font-bold text-foreground">BluFix</span>
        </div>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Iniciar sesión
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-6">
          Software para talleres de reparación
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground leading-tight mb-4">
          Gestiona tu taller de celulares<br />
          <span className="text-primary">de forma profesional</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          Órdenes, inventario, técnicos, caja y WhatsApp — todo en un solo sistema diseñado para talleres de reparación.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/demo/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Ver demo gratis →
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-secondary text-foreground rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{title}</h3>
              <p className="text-muted-foreground text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
          <h2 className="font-display font-bold text-2xl text-foreground">
            ¿Listo para probarlo?
          </h2>
          <p className="text-muted-foreground text-sm">
            Entra al demo y explora el sistema completo con datos reales de ejemplo.
          </p>
          <Link
            href="/demo/login"
            className="inline-flex px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Entrar al demo →
          </Link>
        </div>
      </section>
    </div>
  )
}
