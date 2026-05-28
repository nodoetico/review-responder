// ============================================================
// API: cron diario que escanea TODOS los locales activos
// Vercel CRON corre esto automaticamente
// ============================================================
import { NextResponse } from "next/server"
import { crearClienteServer } from "@/lib/supabase-server"
import { obtenerResenas } from "@/lib/google-places"
import { generarRespuesta } from "@/lib/groq"

export const maxDuration = 300 // 5 minutos maximo (plan Pro)

export async function GET() {
  try {
    const supabase = crearClienteServer()

    // Si no hay Google Places key, el cron no puede escanear
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ ok: true, mensaje: "Google Places API no configurada, cron saltado" })
    }

    const { data: locales } = await supabase.from("locales").select("*").eq("activo", true)
    if (!locales?.length) {
      return NextResponse.json({ ok: true, mensaje: "No hay locales activos" })
    }

    let totalNuevas = 0

    for (const local of locales) {
      if (local.google_place_id === "pendiente" || !local.google_place_id) continue
      try {
        const resultado = await obtenerResenas(local.google_place_id)
        if (!resultado?.reviews) continue

        if (resultado.rating) {
          await supabase.from("locales").update({
            rating_actual: resultado.rating,
            total_resenas: resultado.user_ratings_total ?? 0,
          }).eq("id", local.id)
        }

        for (const review of resultado.reviews) {
          const { data: existente } = await supabase
            .from("resenas")
            .select("id")
            .eq("local_id", local.id)
            .eq("autor", review.author_name)
            .eq("texto", review.text)
            .maybeSingle()

          if (existente) continue

          let respuesta = ""
          try {
            respuesta = await generarRespuesta({
              autor: review.author_name,
              rating: review.rating,
              texto: review.text,
              nombre_local: local.nombre,
            })
          } catch {
            respuesta = `Gracias por tu reseña, ${review.author_name}. Valoramos tu opinión.`
          }

          await supabase.from("resenas").insert({
            local_id: local.id,
            autor: review.author_name,
            rating: review.rating,
            texto: review.text,
            fecha_google: new Date(review.time * 1000).toISOString(),
            respuesta_generada: respuesta,
            respondida: false,
          })

          totalNuevas++
        }
      } catch (err) {
        console.error(`Error escaneando local ${local.id}:`, err)
      }
    }

    return NextResponse.json({ ok: true, nuevas_resenas: totalNuevas })
  } catch (err) {
    console.error("Error en cron:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
