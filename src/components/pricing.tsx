"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { crearClienteBrowser } from "@/lib/supabase-client"

const planes = [
  {
    nombre: "Gratis",
    precio: 0,
    destacado: false,
    caracteristicas: [
      "1 local",
      "10 reseñas/mes",
      "Respuestas con IA",
      "Aprobación manual",
    ],
    cta: "Empezar gratis",
  },
  {
    nombre: "Starter",
    precio: 12,
    destacado: true,
    caracteristicas: [
      "3 locales",
      "Reseñas ilimitadas",
      "Respuestas con IA",
      "Escaneo automático",
      "Alertas por email",
    ],
    cta: "Suscribirse",
  },
  {
    nombre: "Pro",
    precio: 29,
    destacado: false,
    caracteristicas: [
      "10 locales",
      "Reseñas ilimitadas",
      "Respuestas con IA",
      "Escaneo automático",
      "Publicación directa",
      "Exportación de datos",
      "Soporte prioritario",
    ],
    cta: "Suscribirse",
  },
]

export default function Pricing() {
  const [moneda, setMoneda] = useState("USD")
  const [simbolo, setSimbolo] = useState("$")
  const [factor, setFactor] = useState(1)
  const [logueado, setLogueado] = useState(false)
  const [gateway, setGateway] = useState("stripe")
  const [cargando, setCargando] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let pais = "US"
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz.includes("Buenos_Aires") || tz.includes("Argentina") || tz.includes("Cordoba")) pais = "AR"
      else if (tz.includes("Mexico")) pais = "MX"
      else if (tz.includes("Bogota")) pais = "CO"
      else if (tz.includes("Santiago")) pais = "CL"
      else if (tz.includes("Lima")) pais = "PE"
      else if (tz.includes("Sao_Paulo") || tz.includes("Brasilia")) pais = "BR"
      else if (tz.includes("Madrid") || tz.includes("Europe")) pais = "ES"
      else if (tz.includes("New_York") || tz.includes("Chicago") || tz.includes("Los_Angeles") || tz.includes("America") || tz.includes("US")) pais = "US"
      else {
        const lang = navigator.language || "en-US"
        const langPais = lang.split("-").pop()?.toUpperCase()
        if (langPais && langPais.length === 2) pais = langPais
      }
    } catch {
      const lang = navigator.language || "en-US"
      const langPais = lang.split("-").pop()?.toUpperCase()
      if (langPais && langPais.length === 2) pais = langPais
    }

    const mapa: Record<string, { codigo: string; simbolo: string; factor: number }> = {
      AR: { codigo: "ARS", simbolo: "$", factor: 1200 },
      MX: { codigo: "MXN", simbolo: "$", factor: 20 },
      CO: { codigo: "COP", simbolo: "$", factor: 4200 },
      CL: { codigo: "CLP", simbolo: "$", factor: 950 },
      PE: { codigo: "PEN", simbolo: "S/", factor: 3.75 },
      BR: { codigo: "BRL", simbolo: "R$", factor: 5.7 },
      ES: { codigo: "EUR", simbolo: "€", factor: 0.95 },
      US: { codigo: "USD", simbolo: "$", factor: 1 },
    }

    const encontrada = pais ? mapa[pais] : null
    if (encontrada) {
      setMoneda(encontrada.codigo)
      setSimbolo(encontrada.simbolo)
      setFactor(encontrada.factor)
    }

    const supabase = crearClienteBrowser()
    supabase.auth.getUser().then(({ data }) => setLogueado(!!data.user))
  }, [])

  const formatear = (precioUSD: number) => {
    if (precioUSD === 0) return "Gratis"
    const convertido = Math.round(precioUSD * factor)
    return `${simbolo}${convertido.toLocaleString()}`
  }

  const handleContratar = async (plan: string) => {
    if (!logueado) {
      router.push("/registro")
      return
    }
    setCargando(plan)
    try {
      const res = await fetch(`/api/checkout/${gateway}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert("Error al crear checkout")
    } catch {
      alert("Error al conectar con la pasarela")
    } finally {
      setCargando(null)
    }
  }

  const GATEWAYS = [
    { id: "stripe", label: "Stripe" },
    { id: "mercadopago", label: "MercadoPago" },
    { id: "paypal", label: "PayPal" },
  ]

  return (
    <section className="max-w-6xl mx-auto px-4 pb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Planes para cada negocio</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-2 text-sm sm:text-base">
        Todos los precios en {moneda}{" "}
        <span className="text-xs text-gray-400">(detectado automáticamente)</span>
      </p>

      {logueado && (
        <div className="flex justify-center gap-2 mb-8">
          {GATEWAYS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGateway(g.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition border ${
                gateway === g.id
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-300"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {planes.map((p) => (
          <div
            key={p.nombre}
            className={`bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl border dark:border-gray-700 flex flex-col ${
              p.destacado ? "ring-2 ring-primary-500 shadow-lg lg:scale-105 dark:ring-primary-400" : "shadow-sm"
            }`}
          >
            {p.destacado && (
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2 text-center">
                Más popular
              </p>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white text-center">{p.nombre}</h3>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-3 text-center">
              {p.precio === 0 ? (
                "Gratis"
              ) : (
                <>
                  {simbolo}{(p.precio * factor).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="text-base font-normal text-gray-400 dark:text-gray-500">/{moneda === "ARS" ? "mes" : "mo"}</span>
                </>
              )}
            </p>

            <ul className="mt-6 space-y-3 flex-1">
              {p.caracteristicas.map((c) => (
                <li key={c} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            {p.precio === 0 ? (
              <Link
                href="/registro"
                className={`block text-center mt-8 py-2.5 rounded-lg font-medium transition ${
                  p.destacado
                    ? "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                    : "border border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700"
                }`}
              >
                {p.cta}
              </Link>
            ) : logueado ? (
              <button
                onClick={() => handleContratar(p.nombre.toLowerCase() === "starter" ? "starter" : "pro")}
                disabled={cargando === (p.nombre.toLowerCase())}
                className={`block text-center mt-8 py-2.5 rounded-lg font-medium transition w-full ${
                  p.destacado
                    ? "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50"
                    : "border border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 disabled:opacity-50"
                }`}
              >
                {cargando === (p.nombre.toLowerCase()) ? "Redirigiendo..." : p.cta}
              </button>
            ) : (
              <Link
                href="/registro"
                className={`block text-center mt-8 py-2.5 rounded-lg font-medium transition ${
                  p.destacado
                    ? "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                    : "border border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700"
                }`}
              >
                {p.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
