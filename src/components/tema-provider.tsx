"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Tema = "claro" | "oscuro"

const TemaContext = createContext<{
  tema: Tema
  toggle: () => void
}>({ tema: "claro", toggle: () => {} })

export function useTema() {
  return useContext(TemaContext)
}

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("claro")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const guardado = localStorage.getItem("tema") as Tema | null
    if (guardado) {
      setTema(guardado)
      document.documentElement.classList.toggle("dark", guardado === "oscuro")
    }
  }, [])

  const toggle = () => {
    const nuevo = tema === "claro" ? "oscuro" : "claro"
    setTema(nuevo)
    localStorage.setItem("tema", nuevo)
    document.documentElement.classList.toggle("dark", nuevo === "oscuro")
  }

  if (!mounted) return <>{children}</>

  return (
    <TemaContext.Provider value={{ tema, toggle }}>
      {children}
    </TemaContext.Provider>
  )
}
