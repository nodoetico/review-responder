"use client"

import { useEffect, useState } from "react"
import { crearClienteBrowser } from "@/lib/supabase-client"
import { CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react"
import type { Subscription, Perfil } from "@/types"

const GATEWAY_INFO = {
  stripe: { nombre: "Stripe", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/30" },
  mercadopago: { nombre: "MercadoPago", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
  paypal: { nombre: "PayPal", color: "text-blue-700", bg: "bg-blue-50 dark:bg-blue-900/30" },
}

const PLAN_INFO = {
  gratis: { nombre: "Gratis", precio: 0 },
  starter: { nombre: "Starter", precio: 12 },
  pro: { nombre: "Pro", precio: 29 },
}

export default function SuscripcionPage() {
  const [sub, setSub] = useState<Subscription | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [cargando, setCargando] = useState(true)
  const [gatewaySeleccionado, setGatewaySeleccionado] = useState<string>("stripe")
  const [checkoutCargando, setCheckoutCargando] = useState(false)

  useEffect(() => {
    fetch("/api/suscripcion").then((r) => r.json()).then((data) => {
      setSub(data.subscription)
      setPerfil(data.perfil)
      setCargando(false)
    })
  }, [])

  const contratarPlan = async (plan: string) => {
    setCheckoutCargando(true)
    try {
      const res = await fetch(`/api/checkout/${gatewaySeleccionado}`, {
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
      setCheckoutCargando(false)
    }
  }

  const cancelarSuscripcion = async () => {
    if (!confirm("¿Cancelar tu suscripción?")) return
  }

  if (cargando) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  const planActual = sub?.plan_tier ?? "gratis"
  const planInfo = PLAN_INFO[planActual]
  const gatewayInfo = sub?.gateway ? GATEWAY_INFO[sub.gateway] : null

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Suscripción</h1>

      {!sub || planActual === "gratis" ? (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Plan actual: Gratis</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Elegí un plan para acceder a más funcionalidades.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Elegir método de pago</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "stripe", label: "Stripe", desc: "Tarjeta de crédito/débito" },
                { id: "mercadopago", label: "MercadoPago", desc: "Pesos argentinos, mexicanos y más" },
                { id: "paypal", label: "PayPal", desc: "Cuenta PayPal" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGatewaySeleccionado(g.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition ${
                    gatewaySeleccionado === g.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{g.label}</p>
                    <p className="text-xs text-gray-500">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[ 
              { key: "starter", nombre: "Starter", precio: 12, features: ["3 locales", "Reseñas ilimitadas", "Respuestas con IA", "Escaneo automático"] },
              { key: "pro", nombre: "Pro", precio: 29, features: ["10 locales", "Reseñas ilimitadas", "Respuestas con IA", "Escaneo automático", "Soporte prioritario"] },
            ].map((plan) => (
              <div key={plan.key} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.nombre}</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${plan.precio}<span className="text-base font-normal text-gray-400">/mes</span></p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => contratarPlan(plan.key)}
                  disabled={checkoutCargando}
                  className="mt-6 w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-medium"
                >
                  {checkoutCargando ? "Redirigiendo..." : `Contratar con ${GATEWAY_INFO[gatewaySeleccionado as keyof typeof GATEWAY_INFO]?.nombre || "pasarela"} »`}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-lg space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan actual</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400">Plan</span>
              <span className="font-semibold text-gray-900 dark:text-white">{planInfo.nombre}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400">Precio</span>
              <span className="font-semibold text-gray-900 dark:text-white">${planInfo.precio}/mes</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400">Estado</span>
              <span className={`flex items-center gap-1 font-medium ${sub.status === "active" ? "text-green-600" : "text-red-600"}`}>
                {sub.status === "active" ? (
                  <><CheckCircle className="w-4 h-4" /> Activo</>
                ) : (
                  <><XCircle className="w-4 h-4" /> {sub.status}</>
                )}
              </span>
            </div>
            {gatewayInfo && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">Pasarela</span>
                <span className={`font-medium ${gatewayInfo.color}`}>{gatewayInfo.nombre}</span>
              </div>
            )}
            {sub.current_period_end && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Próximo cobro</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {new Date(sub.current_period_end).toLocaleDateString("es-AR")}
                </span>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Para cambiar de plan o cancelar, contactanos a soporte@replivo.com
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
