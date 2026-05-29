import { crearClienteServer } from "./supabase-server"
import { PLANES } from "@/types"

export async function obtenerSuscripcion(usuarioId: string) {
  const supabase = crearClienteServer()
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("usuario_id", usuarioId)
    .maybeSingle()

  if (!sub || sub.status !== "active") return null
  return sub
}

export async function verificarLimiteLocales(usuarioId: string) {
  const supabase = crearClienteServer()
  const sub = await obtenerSuscripcion(usuarioId)
  const plan: keyof typeof PLANES = sub?.plan_tier ?? "gratis"
  const maxLocales = PLANES[plan].locales_max

  const { count } = await supabase
    .from("locales")
    .select("*", { count: "exact", head: true })
    .eq("usuario_id", usuarioId)

  return { puedeAgregar: (count ?? 0) < maxLocales, actual: count ?? 0, maximo: maxLocales, plan }
}

export async function verificarLimiteResenas(usuarioId: string, fecha: string) {
  const supabase = crearClienteServer()
  const sub = await obtenerSuscripcion(usuarioId)
  const plan: keyof typeof PLANES = sub?.plan_tier ?? "gratis"
  const maxDia = PLANES[plan].resenas_por_dia

  const inicioDia = new Date(fecha)
  inicioDia.setHours(0, 0, 0, 0)
  const finDia = new Date(fecha)
  finDia.setHours(23, 59, 59, 999)

  const { count } = await supabase
    .from("resenas")
    .select("*", { count: "exact", head: true })
    .in("local_id", (await supabase.from("locales").select("id").eq("usuario_id", usuarioId)).data?.map(l => l.id) ?? [])
    .gte("creado_en", inicioDia.toISOString())
    .lte("creado_en", finDia.toISOString())

  return { puedeCrear: (count ?? 0) < maxDia, actual: count ?? 0, maximo: maxDia, plan }
}
