// ============================================================
// Dashboard principal: resumen del estado de los locales
// ============================================================
"use client"

import { useEffect, useState } from "react"
import { crearClienteBrowser } from "@/lib/supabase-client"
import { Store, MessageSquare, Star } from "lucide-react"
import Link from "next/link"

interface Resumen {
  locales: number
  resenas_pendientes: number
  rating_promedio: number | null
}

export default function DashboardInicio() {
  const [resumen, setResumen] = useState<Resumen | null>(null)

  useEffect(() => {
    const supabase = crearClienteBrowser()

    supabase.from("locales").select("*").then(({ data: locales }) => {
      if (!locales) return

      supabase
        .from("resenas")
        .select("*")
        .in("local_id", locales.map((l) => l.id))
        .then(({ data: resenas }) => {
          const pendientes = resenas?.filter((r) => !r.respondida).length ?? 0
          const ratings = resenas?.map((r) => r.rating) ?? []
          const promedio = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null

          setResumen({
            locales: locales.length,
            resenas_pendientes: pendientes,
            rating_promedio: promedio,
          })
        })
    })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Panel de control</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
          <Store className="w-8 h-8 text-primary-500 mb-3" />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{resumen?.locales ?? 0}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Locales registrados</p>
          <Link href="/dashboard/locales" className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-2 block">
            Administrar →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
          <MessageSquare className="w-8 h-8 text-yellow-500 mb-3" />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{resumen?.resenas_pendientes ?? 0}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Respuestas pendientes</p>
          <Link href="/dashboard/resenas" className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-2 block">
            Revisar →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
          <Star className="w-8 h-8 text-yellow-500 mb-3" />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{resumen?.rating_promedio?.toFixed(1) ?? "—"}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Rating promedio</p>
        </div>
      </div>

      {(!resumen || resumen.locales === 0) && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Todavía no agregaste ningún local</h2>
          <p className="text-blue-600 dark:text-blue-400 mb-4">Agregá tu primer negocio para empezar a recibir reseñas.</p>
          <Link
            href="/dashboard/locales"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Agregar local
          </Link>
        </div>
      )}
    </div>
  )
}
