// ============================================================
// Cliente para Google Places API (obtener reseñas de Google Maps)
// ============================================================

interface GooglePlaceResult {
  rating?: number
  user_ratings_total?: number
  reviews?: Array<{
    author_name: string
    rating: number
    text: string
    time: number
    relative_time_description: string
  }>
}

// Obtiene los detalles y reseñas de un local usando su Place ID
export async function obtenerResenas(placeId: string): Promise<GooglePlaceResult | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&language=es&key=${process.env.GOOGLE_PLACES_API_KEY}`

  const respuesta = await fetch(url)

  if (!respuesta.ok) {
    const error = await respuesta.text()
    throw new Error(`Google Places API error: ${respuesta.status} - ${error}`)
  }

  const json = await respuesta.json()

  if (json.status !== "OK") {
    console.error("Google Places API status:", json.status, json.error_message)
    return null
  }

  return json.result as GooglePlaceResult
}

// Busca un lugar por nombre y direccion para obtener su Place ID
export async function buscarPlaceId(
  nombre: string,
  direccion: string
): Promise<string | null> {
  const query = encodeURIComponent(`${nombre} ${direccion}`)
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${process.env.GOOGLE_PLACES_API_KEY}`

  const respuesta = await fetch(url)
  const json = await respuesta.json()

  if (json.status !== "OK" || !json.candidates?.length) {
    return null
  }

  return json.candidates[0].place_id
}
