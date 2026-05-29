import { NextResponse } from "next/server"
import { stripe, PLANES_STRIPE } from "@/lib/stripe"
import { crearClienteServer } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const supabase = crearClienteServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { plan }: { plan: "starter" | "pro" } = await req.json()
    if (!PLANES_STRIPE[plan]) return NextResponse.json({ error: "Plan inválido" }, { status: 400 })

    const origin = req.headers.get("origin") || "http://localhost:3000"

    const { data: perfil } = await supabase.from("perfiles").select("stripe_customer_id").eq("id", user.id).maybeSingle()

    let customerId = perfil?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_id: user.id },
      })
      customerId = customer.id
      await supabase.from("perfiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PLANES_STRIPE[plan].price_id, quantity: 1 }],
      success_url: `${origin}/dashboard/suscripcion?success=true`,
      cancel_url: `${origin}/dashboard/suscripcion?canceled=true`,
      metadata: { supabase_id: user.id, plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Error al crear checkout" }, { status: 500 })
  }
}
