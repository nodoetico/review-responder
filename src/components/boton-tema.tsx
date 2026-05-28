"use client"

import { useTema } from "./tema-provider"
import { Moon, Sun } from "lucide-react"

export default function BotonTema({ className = "" }: { className?: string }) {
  const { tema, toggle } = useTema()

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ${className}`}
      title={tema === "claro" ? "Modo oscuro" : "Modo claro"}
    >
      {tema === "claro" ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
    </button>
  )
}
