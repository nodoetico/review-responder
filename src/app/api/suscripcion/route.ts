import { NextResponse } from "next/server"
import { crearClienteServer } from "@/lib/supabase-server"

export async function GET() {
  const supabase = crearClienteServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("usuario_id", user.id)
    .maybeSingle()

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return NextResponse.json({
    subscription: sub ?? { plan_tier: "gratis", status: "active", gateway: null },
    perfil,
  })
}
