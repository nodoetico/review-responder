import { NextResponse } from "next/server"
import { mercadopagoPayment } from "@/lib/mercadopago"
import { crearClienteServer } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, data } = body

    const supabase = crearClienteServer()

    if (type === "payment" || type === "subscription_authorized_payment") {
      const payment = await mercadopagoPayment.get({ id: data.id })

      const status = payment.status
      const externalRef = payment.external_reference
      if (!externalRef) return NextResponse.json({ received: true })

      let dbStatus: string
      switch (status) {
        case "authorized":
        case "approved":
          dbStatus = "active"
          break
        case "cancelled":
          dbStatus = "cancelled"
          break
        case "refunded":
        case "charged_back":
          dbStatus = "past_due"
          break
        default:
          dbStatus = "incomplete"
      }

      const planTier = payment.description?.includes("Pro") ? "pro" : "starter"

      await supabase.from("subscriptions").upsert({
        usuario_id: externalRef,
        plan_tier: planTier,
        status: dbStatus,
        gateway: "mercadopago",
        gateway_subscription_id: data.id.toString(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: "usuario_id", ignoreDuplicates: false })
    }

    if (type === "subscription_cancelled") {
      const subId = data.id.toString()
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("gateway_subscription_id", subId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("MercadoPago webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
