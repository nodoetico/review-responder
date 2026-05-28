// ============================================================
// API: genera una respuesta con Groq para una reseña manual
// ============================================================
import { NextRequest, NextResponse } from "next/server"
import { generarRespuesta } from "@/lib/groq"

export async function POST(req: NextRequest) {
  try {
    const { autor, rating, texto, nombre_local } = await req.json()

    if (!autor || !rating || !texto || !nombre_local) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const respuesta = await generarRespuesta({ autor, rating, texto, nombre_local })

    return NextResponse.json({ respuesta })
  } catch (err) {
    console.error("Error generando respuesta:", err)
    return NextResponse.json({ error: "Error generando respuesta" }, { status: 500 })
  }
}
