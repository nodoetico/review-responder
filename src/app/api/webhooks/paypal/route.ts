import { NextResponse } from "next/server"
import { paypalVerifyWebhook, paypalGetSubscription } from "@/lib/paypal"
import { crearClienteServer } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headers = Object.fromEntries(req.headers.entries())

    const isValid = await paypalVerifyWebhook(headers, body)
    if (!isValid) return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })

    const event = JSON.parse(body)
    const supabase = crearClienteServer()

    if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" ||
        event.event_type === "BILLING.SUBSCRIPTION.UPDATED" ||
        event.event_type === "PAYMENT.SALE.COMPLETED") {
      const resource = event.resource
      const subscriptionId = resource.id || resource.billing_agreement_id

      if (subscriptionId) {
        const subscription = await paypalGetSubscription(subscriptionId)
        const customId = subscription.custom_id || resource.custom_id

        if (customId) {
          const planTier = subscription.plan_id === process.env.PAYPAL_PLAN_PRO ? "pro" : "starter"

          await supabase.from("subscriptions").upsert({
            usuario_id: customId,
            plan_tier: planTier,
            status: "active",
            gateway: "paypal",
            gateway_subscription_id: subscriptionId,
            current_period_start: new Date(subscription.start_time).toISOString(),
            current_period_end: new Date(
              new Date(subscription.start_time).getTime() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          }, { onConflict: "usuario_id", ignoreDuplicates: false })
        }
      }
    }

    if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      const subscriptionId = event.resource.id
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("gateway_subscription_id", subscriptionId)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("PayPal webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
