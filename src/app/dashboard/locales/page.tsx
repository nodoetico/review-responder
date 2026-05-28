// ============================================================
// Gestion de locales: agregar, listar y eliminar negocios
// ============================================================
"use client"

import { useEffect, useState } from "react"
import { crearClienteBrowser } from "@/lib/supabase-client"
import { Trash2, Plus } from "lucide-react"

interface Local {
  id: string
  nombre: string
  direccion: string
  google_place_id: string
  rating_actual: number | null
  activo: boolean
}

export default function LocalesPage() {
  const [locales, setLocales] = useState<Local[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState("")
  const [direccion, setDireccion] = useState("")
  const [googlePlaceId, setGooglePlaceId] = useState("")
  const [cargando, setCargando] = useState(false)

  const supabase = crearClienteBrowser()

  const cargarLocales = async () => {
    const { data } = await supabase.from("locales").select("*")
    if (data) setLocales(data)
  }

  useEffect(() => { cargarLocales() }, [])

  const agregarLocal = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    const usuario = await supabase.auth.getUser()
    if (!usuario.data.user) return

    const { error } = await supabase.from("locales").insert({
      usuario_id: usuario.data.user.id,
      nombre,
      direccion,
      google_place_id: googlePlaceId || "pendiente",
      activo: true,
    })

    if (!error) {
      setNombre("")
      setDireccion("")
      setGooglePlaceId("")
      setMostrarForm(false)
      cargarLocales()
    }

    setCargando(false)
  }

  const eliminarLocal = async (id: string) => {
    if (!confirm("¿Eliminar este local y todas sus reseñas?")) return
    await supabase.from("resenas").delete().eq("local_id", id)
    await supabase.from("locales").delete().eq("id", id)
    cargarLocales()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Mis locales</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Agregar local
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={agregarLocal} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 mb-8">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Nuevo local</h2>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del negocio</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Ej: Pizzería La Nueva"
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
          <input
            type="text"
            required
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Ej: Av. Siempreviva 742"
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Google Place ID <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional — para escaneo automático)</span>
          </label>
          <input
            type="text"
            value={googlePlaceId}
            onChange={(e) => setGooglePlaceId(e.target.value)}
            className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Ej: ChIJN1t_tDeuEmsRUsoyG83frY4"
          />
          <button
            type="submit"
            disabled={cargando}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {cargando ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      {locales.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
          No tenés locales registrados. Agregá tu primer negocio.
        </div>
      ) : (
        <div className="space-y-4">
          {locales.map((local) => (
            <div key={local.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{local.nombre}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{local.direccion}</p>
                  {local.rating_actual && (
                    <p className="text-sm text-yellow-600">★ {local.rating_actual.toFixed(1)}</p>
                  )}
                  {local.google_place_id === "pendiente" && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">⏳ Sin Place ID — cargá reseñas manualmente</p>
                  )}
                </div>
              <button
                onClick={() => eliminarLocal(local.id)}
                className="text-red-400 hover:text-red-600 transition p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
