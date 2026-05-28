"use client"

import { useEffect, useState } from "react"
import { crearClienteBrowser } from "@/lib/supabase-client"
import { Plus, Sparkles } from "lucide-react"

interface ResenaConLocal {
  id: string
  local_nombre: string
  local_id: string
  autor: string
  rating: number
  texto: string
  respondida: boolean
  respuesta_generada: string | null
  respuesta_aprobada: boolean | null
}

export default function ResenasPage() {
  const [resenas, setResenas] = useState<ResenaConLocal[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [textoEditado, setTextoEditado] = useState("")
  const [mostrarCarga, setMostrarCarga] = useState(false)
  const [locales, setLocales] = useState<{ id: string; nombre: string }[]>([])
  const [localSeleccionado, setLocalSeleccionado] = useState("")
  const [autor, setAutor] = useState("")
  const [rating, setRating] = useState(5)
  const [textoResena, setTextoResena] = useState("")
  const [cargandoIA, setCargandoIA] = useState(false)
  const [errorIA, setErrorIA] = useState("")

  const supabase = crearClienteBrowser()

  const cargarResenas = async () => {
    const usuario = await supabase.auth.getUser()
    if (!usuario.data.user) return

    const { data: localesData } = await supabase.from("locales").select("id, nombre").eq("usuario_id", usuario.data.user.id)
    setLocales(localesData ?? [])
    if (!localesData?.length) return

    const localIds = localesData.map((l) => l.id)
    const { data: resenasData } = await supabase.from("resenas").select("*").in("local_id", localIds).order("fecha_google", { ascending: false })

    if (resenasData) {
      const localMap = new Map(localesData.map((l) => [l.id, l.nombre]))
      setResenas(
        resenasData.map((r) => ({
          ...r,
          local_nombre: localMap.get(r.local_id) ?? "Desconocido",
        }))
      )
    }
  }

  useEffect(() => { cargarResenas() }, [])

  const aprobarRespuesta = async (id: string) => {
    await supabase.from("resenas").update({ respondida: true, respuesta_aprobada: true }).eq("id", id)
    cargarResenas()
  }

  const rechazarRespuesta = async (id: string) => {
    await supabase.from("resenas").update({ respondida: false, respuesta_generada: null, respuesta_aprobada: null }).eq("id", id)
    cargarResenas()
  }

  const guardarEditado = async (id: string) => {
    await supabase.from("resenas").update({ respuesta_generada: textoEditado, respondida: true, respuesta_aprobada: true }).eq("id", id)
    setEditandoId(null)
    cargarResenas()
  }

  const cargarResenaManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localSeleccionado || !autor || !textoResena) return
    setCargandoIA(true)

    const localNombre = locales.find((l) => l.id === localSeleccionado)?.nombre ?? ""

    let respuesta = ""
    setErrorIA("")
    try {
      const res = await fetch("/api/generar-respuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autor, rating, texto: textoResena, nombre_local: localNombre }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || `Error ${res.status}`)
      }
      respuesta = json.respuesta
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido"
      setErrorIA(`Error con la IA: ${msg}. Se usó respuesta genérica.`)
      respuesta = `Gracias por tu reseña, ${autor}. Valoramos tu opinión y trabajamos para mejorar cada día.`
    }

    await supabase.from("resenas").insert({
      local_id: localSeleccionado,
      autor,
      rating,
      texto: textoResena,
      fecha_google: new Date().toISOString(),
      respuesta_generada: respuesta,
      respondida: false,
    })

    setAutor("")
    setTextoResena("")
    setRating(5)
    setMostrarCarga(false)
    setCargandoIA(false)
    cargarResenas()
  }

  const renderStars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Reseñas</h1>
        <button
          onClick={() => setMostrarCarga(!mostrarCarga)}
          className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Cargar reseña manual
        </button>
      </div>

      {mostrarCarga && (
        <form onSubmit={cargarResenaManual} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 mb-8">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Cargar reseña manual (se genera respuesta automática con IA)
          </h2>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Local</label>
          <select
            required
            value={localSeleccionado}
            onChange={(e) => setLocalSeleccionado(e.target.value)}
            className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Seleccionar local...</option>
            {locales.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del cliente</label>
              <input type="text" required value={autor} onChange={(e) => setAutor(e.target.value)}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Ej: Juan Pérez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating (1-5)</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} estrella{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Texto de la reseña</label>
          <textarea required value={textoResena} onChange={(e) => setTextoResena(e.target.value)}
            className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3}
            placeholder="Pegá acá el texto de la reseña..." />

          <button type="submit" disabled={cargandoIA}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
            {cargandoIA ? "Generando respuesta con IA..." : "Cargar y generar respuesta"}
          </button>
          {errorIA && <p className="text-red-500 text-sm mt-2">{errorIA}</p>}
        </form>
      )}

      {resenas.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
          No hay reseñas todavía. Cargá la primera manualmente con el botón "Cargar reseña manual".
        </div>
      ) : (
        <div className="space-y-4">
          {resenas.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{r.local_nombre}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{r.autor}</p>
                  <p className="text-yellow-500 text-sm">{renderStars(r.rating)}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">&quot;{r.texto}&quot;</p>

              {r.respuesta_generada && !r.respondida && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border dark:border-blue-800 border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Respuesta generada por IA:</p>
                  {editandoId === r.id ? (
                    <div>
                      <textarea value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)}
                        className="w-full border dark:border-gray-600 rounded-lg p-2 text-sm mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} />
                      <div className="flex gap-2">
                        <button onClick={() => guardarEditado(r.id)}
                          className="bg-primary-600 text-white px-4 py-1.5 rounded text-sm hover:bg-primary-700 transition">Guardar</button>
                        <button onClick={() => setEditandoId(null)}
                          className="text-gray-500 px-4 py-1.5 rounded text-sm hover:bg-gray-100 transition">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{r.respuesta_generada}</p>
                      <div className="flex gap-2">
                        <button onClick={() => aprobarRespuesta(r.id)}
                          className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700 transition">Aprobar</button>
                        <button onClick={() => { setEditandoId(r.id); setTextoEditado(r.respuesta_generada ?? "") }}
                          className="bg-yellow-500 text-white px-4 py-1.5 rounded text-sm hover:bg-yellow-600 transition">Editar</button>
                        <button onClick={() => rechazarRespuesta(r.id)}
                          className="text-red-500 px-4 py-1.5 rounded text-sm hover:bg-red-50 transition">Rechazar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {r.respondida && (
                <div className="bg-green-50 dark:bg-green-900/30 border dark:border-green-800 border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">✓ Respuesta aprobada</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{r.respuesta_generada}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
