// ============================================================
// Tipos y esquemas compartidos de Review Responder
// ============================================================

// Representa un negocio/local registrado por el usuario
export interface Local {
  id: string
  usuario_id: string
  nombre: string
  direccion: string
  google_place_id: string
  rating_actual: number | null
  total_resenas: number | null
  activo: boolean
  creado_en: string
}

// Representa una reseña obtenida desde Google Places
export interface Resena {
  id: string
  local_id: string
  autor: string
  rating: number
  texto: string
  fecha_google: string
  respondida: boolean
  respuesta_generada: string | null
  respuesta_aprobada: boolean | null
  creado_en: string
}

// Perfil del usuario (dueño del negocio)
export interface Usuario {
  id: string
  email: string
  nombre: string
  empresa: string | null
  creado_en: string
}

// Configuración del plan gratuito
export const PLAN_GRATIS = {
  locales_max: 3,
  resenas_por_dia: 50,
} as const

export interface Subscription {
  id: string
  usuario_id: string
  plan_tier: "gratis" | "starter" | "pro"
  status: "active" | "cancelled" | "past_due" | "incomplete" | "trialing"
  gateway: "stripe" | "mercadopago" | "paypal" | null
  gateway_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  creado_en: string
  actualizado_en: string
}

export interface Perfil {
  id: string
  email: string | null
  nombre: string | null
  stripe_customer_id: string | null
  mercadopago_id: string | null
  paypal_id: string | null
}

export const PLANES = {
  gratis: { nombre: "Gratis", precio: 0, locales_max: 1, resenas_por_dia: 10 },
  starter: { nombre: "Starter", precio: 12, locales_max: 3, resenas_por_dia: 9999 },
  pro: { nombre: "Pro", precio: 29, locales_max: 10, resenas_por_dia: 9999 },
} as const
