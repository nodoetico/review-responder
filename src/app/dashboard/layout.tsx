"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { crearClienteBrowser } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"
import { Store, MessageSquare, Settings, LogOut, Home, Menu, X } from "lucide-react"
import Image from "next/image"
import BotonTema from "@/components/boton-tema"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/locales", label: "Mis locales", icon: Store },
  { href: "/dashboard/resenas", label: "Reseñas", icon: MessageSquare },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarAbierta, setSidebarAbierta] = useState(false)
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

  useEffect(() => { setSidebarAbierta(false) }, [pathname])

  const handleLogout = async () => {
    const supabase = crearClienteBrowser()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!user) return null

  const Sidebar = () => (
    <aside className="bg-gray-900 dark:bg-black text-white p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <Image src="/logo-blanco.png" alt="Replivo" width={140} height={140} className="rounded-lg w-20 sm:w-24 lg:w-[140px] h-auto" />
        <button onClick={() => setSidebarAbierta(false)} className="lg:hidden text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
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
                activo ? "bg-primary-600 text-white" : "text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-900"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="flex items-center gap-2 mt-auto mb-2">
        <BotonTema className="text-gray-400 hover:text-white" />
        <span className="text-xs text-gray-500">Modo oscuro</span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition"
      >
        <LogOut className="w-5 h-5 shrink-0" />
        Cerrar sesión
      </button>
    </aside>
  )

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar mobile overlay */}
      {sidebarAbierta && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarAbierta(false)} />
          <div className="relative w-64 max-w-[80vw]">
            <Sidebar />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-3 sticky top-0 z-40">
          <button onClick={() => setSidebarAbierta(true)} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <Image src="/logo-blanco.png" alt="Replivo" width={40} height={40} className="rounded-lg invert dark:invert-0" />
          <div className="ml-auto">
            <BotonTema />
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
