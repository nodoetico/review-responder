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
