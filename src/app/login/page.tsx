// ============================================================
// Pagina de inicio de sesion
// ============================================================
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { crearClienteBrowser } from "@/lib/supabase-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const supabase = crearClienteBrowser()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError("Email o contraseña incorrectos")
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border dark:border-gray-700 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Iniciar sesión</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />

        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition font-medium"
        >
          Entrar
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-primary-600 dark:text-primary-400 hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  )
}
