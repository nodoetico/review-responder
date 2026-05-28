"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

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
    ctaLink: "/registro",
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
    cta: "Probar gratis",
    ctaLink: "/registro",
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
    cta: "Probar gratis",
    ctaLink: "/registro",
  },
]

export default function Pricing() {
  const [moneda, setMoneda] = useState("USD")
  const [simbolo, setSimbolo] = useState("$")
  const [factor, setFactor] = useState(1)

  useEffect(() => {
    // Detectar país por zona horaria (más preciso que navigator.language)
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
        // Fallback a navigator.language
        const lang = navigator.language || "en-US"
        const langPais = lang.split("-").pop()?.toUpperCase()
        if (langPais && langPais.length === 2) pais = langPais
      }
    } catch {
      const lang = navigator.language || "en-US"
      const langPais = lang.split("-").pop()?.toUpperCase()
      if (langPais && langPais.length === 2) pais = langPais
    }

    // Mapeo de países a monedas
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
  }, [])

  const formatear = (precioUSD: number) => {
    if (precioUSD === 0) return "Gratis"
    const convertido = Math.round(precioUSD * factor)
    return `${simbolo}${convertido.toLocaleString()}`
  }

  return (
    <section className="max-w-6xl mx-auto px-4 pb-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Planes para cada negocio</h2>
      <p className="text-center text-gray-500 mb-12">
        Todos los precios en {moneda}{" "}
        <span className="text-xs text-gray-400">(detectado automáticamente)</span>
      </p>

      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {planes.map((p) => (
          <div
            key={p.nombre}
            className={`bg-white p-8 rounded-xl border flex flex-col ${
              p.destacado ? "ring-2 ring-primary-500 shadow-lg md:scale-105" : "shadow-sm"
            }`}
          >
            {p.destacado && (
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2 text-center">
                Más popular
              </p>
            )}
            <h3 className="text-xl font-bold text-gray-900 text-center">{p.nombre}</h3>
            <p className="text-4xl font-bold text-gray-900 mt-3 text-center">
              {p.precio === 0 ? (
                "Gratis"
              ) : (
                <>
                  {simbolo}{(p.precio * factor).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="text-base font-normal text-gray-400">/{moneda === "ARS" ? "mes" : "mo"}</span>
                </>
              )}
            </p>

            <ul className="mt-6 space-y-3 flex-1">
              {p.caracteristicas.map((c) => (
                <li key={c} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            <Link
              href={p.ctaLink}
              className={`block text-center mt-8 py-2.5 rounded-lg font-medium transition ${
                p.destacado
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "border border-primary-600 text-primary-600 hover:bg-primary-50"
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
