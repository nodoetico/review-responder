// ============================================================
// API: escanear reseñas de un local desde Google Places
// ============================================================
import { NextRequest, NextResponse } from "next/server"
import { crearClienteServer } from "@/lib/supabase-server"
import { obtenerResenas } from "@/lib/google-places"
import { generarRespuesta } from "@/lib/groq"

export async function POST(req: NextRequest) {
  try {
    const { localId } = await req.json()
    if (!localId) {
      return NextResponse.json({ error: "Falta localId" }, { status: 400 })
    }

    const supabase = crearClienteServer()

    // Obtener el local
    const { data: local } = await supabase.from("locales").select("*").eq("id", localId).single()
    if (!local) {
      return NextResponse.json({ error: "Local no encontrado" }, { status: 404 })
    }

    // Verificar que tenga API key configurada
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json({ error: "Google Places API no configurada. Cargá las reseñas manualmente desde el dashboard." }, { status: 400 })
    }

    if (local.google_place_id === "pendiente" || !local.google_place_id) {
      return NextResponse.json({ error: "Este local no tiene un Google Place ID. Cargá las reseñas manualmente." }, { status: 400 })
    }

    // Obtener reseñas desde Google Places
    const resultado = await obtenerResenas(local.google_place_id)
    if (!resultado || !resultado.reviews) {
      return NextResponse.json({ error: "No se pudieron obtener reseñas" }, { status: 500 })
    }

    // Actualizar rating del local
    if (resultado.rating) {
      await supabase.from("locales").update({
        rating_actual: resultado.rating,
        total_resenas: resultado.user_ratings_total ?? 0,
      }).eq("id", localId)
    }

    let nuevas = 0

    for (const review of resultado.reviews) {
      // Verificar si ya existe
      const { data: existente } = await supabase
        .from("resenas")
        .select("id")
        .eq("local_id", localId)
        .eq("autor", review.author_name)
        .eq("texto", review.text)
        .maybeSingle()

      if (existente) continue

      // Generar respuesta con IA
      let respuesta = ""
      try {
        respuesta = await generarRespuesta({
          autor: review.author_name,
          rating: review.rating,
          texto: review.text,
          nombre_local: local.nombre,
        })
      } catch (err) {
        console.error("Error generando respuesta para", review.author_name, err)
        respuesta = `Gracias por tu reseña, ${review.author_name}. Valoramos tu opinión.`
      }

      // Guardar reseña en la BD
      await supabase.from("resenas").insert({
        local_id: localId,
        autor: review.author_name,
        rating: review.rating,
        texto: review.text,
        fecha_google: new Date(review.time * 1000).toISOString(),
        respuesta_generada: respuesta,
        respondida: false,
      })

      nuevas++
    }

    return NextResponse.json({ ok: true, nuevas_resenas: nuevas })
  } catch (err) {
    console.error("Error en scan:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
