// ============================================================
// Landing page de Review Responder
// Muestra el producto, beneficios y CTA para registrarse
// ============================================================
import Link from "next/link"
import Image from "next/image"
import Pricing from "@/components/pricing"
import BotonTema from "@/components/boton-tema"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <header className="border-b dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <Image src="/logo.png" alt="Replivo" width={170} height={170} className="rounded-lg dark:hidden w-[90px] sm:w-28 lg:w-[170px] h-auto" />
            <Image src="/logo-blanco.png" alt="Replivo" width={170} height={170} className="rounded-lg hidden dark:block w-[90px] sm:w-28 lg:w-[170px] h-auto" />
          </div>
          <div className="flex gap-2 sm:gap-3 items-center">
            <BotonTema />
            <Link href="/login" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-4 py-2 whitespace-nowrap">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="text-sm sm:text-base bg-primary-600 text-white px-3 sm:px-5 py-2 rounded-lg hover:bg-primary-700 transition whitespace-nowrap"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight max-w-3xl mx-auto">
            Nunca más pierdas un cliente por no responder reseñas
          </h2>
          <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 mt-4 sm:mt-6 max-w-2xl mx-auto">
            Respondemos automáticamente cada reseña de Google Maps con IA. Vos solo aprobás o editás.
          </p>
          <Link
            href="/registro"
            className="inline-block mt-6 sm:mt-8 bg-primary-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-primary-700 transition shadow-lg"
          >
            Comenzar gratis — sin tarjeta
          </Link>
          <p className="text-xs sm:text-sm text-gray-400 mt-3">Sin tarjeta de crédito • Cancela cuando quieras</p>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {beneficios.map((b) => (
            <div key={b.titulo} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition">
              <div className="text-3xl mb-4">{b.icono}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{b.titulo}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{b.descripcion}</p>
            </div>
          ))}
        </section>

        {/* Planes */}
        <Pricing />

        <section className="bg-primary-600 dark:bg-primary-800 text-white py-12 sm:py-20 px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Empezá a cuidar tu reputación hoy</h2>
          <p className="text-primary-100 dark:text-primary-200 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Configurás tu local en 2 minutos. Nosotros nos encargamos del resto.
          </p>
          <Link
            href="/registro"
            className="inline-block mt-6 bg-white text-primary-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-primary-50 transition text-sm sm:text-base"
          >
            Crear cuenta gratis
          </Link>
        </section>
      </main>

      <footer className="border-t dark:border-gray-800 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
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
