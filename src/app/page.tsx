// ============================================================
// Landing page de Review Responder
// Muestra el producto, beneficios y CTA para registrarse
// ============================================================
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Replivo" width={48} height={48} className="rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
          <h2 className="text-5xl font-bold text-gray-900 leading-tight max-w-3xl mx-auto">
            Nunca más pierdas un cliente por no responder reseñas
          </h2>
          <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto">
            Respondemos automáticamente cada reseña de Google Maps con IA. Vos solo aprobás o editás.
          </p>
          <Link
            href="/registro"
            className="inline-block mt-8 bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg"
          >
            Comenzar gratis — sin tarjeta
          </Link>
          <p className="text-sm text-gray-400 mt-3">Sin tarjeta de crédito • Cancela cuando quieras</p>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
          {beneficios.map((b) => (
            <div key={b.titulo} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
              <div className="text-3xl mb-4">{b.icono}</div>
              <h3 className="text-lg font-semibold text-gray-900">{b.titulo}</h3>
              <p className="text-gray-500 mt-2">{b.descripcion}</p>
            </div>
          ))}
        </section>

        {/* Planes */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Planes para cada negocio</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {planes.map((p) => (
              <div key={p.nombre} className={`bg-white p-8 rounded-xl border ${p.destacado ? "ring-2 ring-primary-500 shadow-lg scale-105" : "shadow-sm"}`}>
                {p.destacado && <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">Más popular</p>}
                <h3 className="text-xl font-bold text-gray-900">{p.nombre}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-4">
                  ${p.precio}<span className="text-sm font-normal text-gray-400">/mes</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {p.caracteristicas.map((c) => (
                    <li key={c} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span> {c}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.ctaLink}
                  className={`block text-center mt-8 py-2.5 rounded-lg font-medium transition ${
                    p.destacado
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "border border-primary-600 text-primary-600 hover:bg-primary-50"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary-600 text-white py-20 text-center">
          <h2 className="text-3xl font-bold">Empezá a cuidar tu reputación hoy</h2>
          <p className="text-primary-100 mt-3 max-w-xl mx-auto">
            Configurás tu local en 2 minutos. Nosotros nos encargamos del resto.
          </p>
          <Link
            href="/registro"
            className="inline-block mt-6 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
          >
            Crear cuenta gratis
          </Link>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-400">
        © 2024 Replivo. Todos los derechos reservados.
      </footer>
    </div>
  )
}

const beneficios = [
  { icono: "🤖", titulo: "Respuestas automáticas con IA", descripcion: "Cada reseña nueva recibe una respuesta profesional generada por inteligencia artificial." },
  { icono: "✅", titulo: "Aprobás antes de publicar", descripcion: "Te avisamos por email. Aprobás, editás o descartás cada respuesta." },
  { icono: "📈", titulo: "Mejor reputación online", descripcion: "Los negocios que responden reseñas tienen 30% más clientes. Nosotros lo hacemos fácil." },
]

const planes = [
  {
    nombre: "Gratis",
    precio: 0,
    destacado: false,
    caracteristicas: [
      "1 local",
      "10 reseñas/mes",
      "Respuestas con IA",
      "Aprobación manual",
      "Sin tarjeta de crédito",
    ],
    cta: "Empezar gratis",
    ctaLink: "/registro",
  },
  {
    nombre: "Starter",
    precio: 12,
    destacado: true,
    caracteristicas: [
      "3 locales",
      "Reseñas ilimitadas",
      "Respuestas con IA",
      "Escaneo automático",
      "Aprobación manual",
      "Alertas por email",
    ],
    cta: "Probar gratis",
    ctaLink: "/registro",
  },
  {
    nombre: "Pro",
    precio: 29,
    destacado: false,
    caracteristicas: [
      "10 locales",
      "Reseñas ilimitadas",
      "Respuestas con IA",
      "Escaneo automático",
      "Publicación directa",
      "Soporte prioritario",
      "Exportación de datos",
    ],
    cta: "Probar gratis",
    ctaLink: "/registro",
  },
]
