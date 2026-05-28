// ============================================================
// Cliente para la API de Groq (gratis, genera respuestas IA)
// ============================================================

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

interface ReviewData {
  autor: string
  rating: number
  texto: string
  nombre_local: string
}

// Genera una respuesta profesional para una reseña usando Groq
export async function generarRespuesta(data: ReviewData): Promise<string> {
  const prompt = `
Eres el dueño de "${data.nombre_local}". 
Un cliente llamado "${data.autor}" dejó una reseña de ${data.rating} estrellas.
Texto de la reseña: "${data.texto}"

Respondé profesionalmente agradeciendo el feedback. 
- Si la reseña es positiva, mostrá gratitud.
- Si es negativa, disculpate, mencioná que vas a mejorar y que vuelvan.
- MÁXIMO 3 oraciones.
- Respondé solamente el texto de la respuesta, sin explicaciones.
`

  const respuesta = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    }),
  })

  if (!respuesta.ok) {
    const error = await respuesta.text()
    throw new Error(`Groq API error: ${respuesta.status} - ${error}`)
  }

  const json = await respuesta.json()
  return json.choices[0].message.content.trim()
}
