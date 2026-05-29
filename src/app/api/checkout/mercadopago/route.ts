import { NextResponse } from "next/server"
import { mercadopagoPreApproval, PLANES_MP } from "@/lib/mercadopago"
import { crearClienteServer } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const supabase = crearClienteServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { plan }: { plan: "starter" | "pro" } = await req.json()
    if (!PLANES_MP[plan]) return NextResponse.json({ error: "Plan inválido" }, { status: 400 })

    const origin = req.headers.get("origin") || "http://localhost:3000"
    const planData = PLANES_MP[plan]

    const preapproval = await mercadopagoPreApproval.create({
      body: {
        reason: planData.title,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: planData.unit_price,
          currency_id: "USD",
        },
        payer_email: user.email!,
        back_url: `${origin}/dashboard/suscripcion?success=true`,
        external_reference: user.id,
        status: "authorized",
      } as any,
    })

    return NextResponse.json({ url: preapproval.init_point })
  } catch (error) {
    console.error("MercadoPago checkout error:", error)
    return NextResponse.json({ error: "Error al crear checkout" }, { status: 500 })
  }
}
