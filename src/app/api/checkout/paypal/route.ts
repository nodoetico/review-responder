import { NextResponse } from "next/server"
import { paypalCreateSubscription, PLANES_PAYPAL } from "@/lib/paypal"
import { crearClienteServer } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const supabase = crearClienteServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { plan }: { plan: "starter" | "pro" } = await req.json()
    if (!PLANES_PAYPAL[plan]) return NextResponse.json({ error: "Plan inválido" }, { status: 400 })

    const origin = req.headers.get("origin") || "http://localhost:3000"
    const planData = PLANES_PAYPAL[plan]

    const subscription = await paypalCreateSubscription(
      planData.plan_id,
      `${origin}/dashboard/suscripcion?success=true`,
      `${origin}/dashboard/suscripcion?canceled=true`,
    )

    const link = subscription.links?.find((l: any) => l.rel === "approve")?.href
    if (!link) throw new Error("No approval link in PayPal response")

    return NextResponse.json({ url: link })
  } catch (error) {
    console.error("PayPal checkout error:", error)
    return NextResponse.json({ error: "Error al crear checkout" }, { status: 500 })
  }
}
