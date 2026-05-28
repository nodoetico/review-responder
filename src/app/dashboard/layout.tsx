// ============================================================
// Layout del dashboard (lado del cliente con autenticacion)
// ============================================================
"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { crearClienteBrowser } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"
import { Store, MessageSquare, Settings, LogOut, Home } from "lucide-react"
import Image from "next/image"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/locales", label: "Mis locales", icon: Store },
  { href: "/dashboard/resenas", label: "Reseñas", icon: MessageSquare },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = crearClienteBrowser()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = crearClienteBrowser()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.png" alt="Replivo" width={32} height={32} className="rounded-lg" />
          <h2 className="text-lg font-bold">Replivo</h2>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const activo = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  activo ? "bg-primary-600 text-white" : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition mt-auto"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
