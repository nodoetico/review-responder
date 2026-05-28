// ============================================================
// Pagina de configuracion de la cuenta
// ============================================================
"use client"

import { useEffect, useState } from "react"
import { crearClienteBrowser } from "@/lib/supabase-client"

export default function ConfiguracionPage() {
  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    const supabase = crearClienteBrowser()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "")
        setNombre(data.user.user_metadata?.nombre ?? "")
      }
    })
  }, [])

  const guardar = async () => {
    const supabase = crearClienteBrowser()
    await supabase.auth.updateUser({ data: { nombre } })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Configuración</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border max-w-lg">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full border rounded-lg px-3 py-2 mb-6 bg-gray-50 text-gray-500"
        />

        <button
          onClick={guardar}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          {guardado ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </div>
    </div>
  )
}
