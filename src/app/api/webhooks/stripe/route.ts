import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { crearClienteServer } from "@/lib/supabase-server"
import type Stripe from "stripe"

function getPeriod(sub: Stripe.Subscription) {
  const item = sub.items?.data?.[0]
  return {
    current_period_start: item ? new Date(item.current_period_start * 1000).toISOString() : new Date().toISOString(),
    current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")!

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!) as Stripe.Event
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = crearClienteServer()

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const supabaseId = session.metadata?.supabase_id
      const plan = session.metadata?.plan || "starter"
      const subscriptionId = session.subscription as string

      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      const period = getPeriod(sub)

      await supabase.from("subscriptions").upsert({
        usuario_id: supabaseId,
        plan_tier: plan,
        status: "active",
        gateway: "stripe",
        gateway_subscription_id: subscriptionId,
        ...period,
        cancel_at_period_end: sub.cancel_at_period_end,
      }, { onConflict: "usuario_id", ignoreDuplicates: false })
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("gateway_subscription_id", sub.id)
        .maybeSingle()

      if (existing) {
        const period = getPeriod(sub)
        await supabase.from("subscriptions").update({
          status: sub.status === "active" ? "active" : "past_due",
          ...period,
          cancel_at_period_end: sub.cancel_at_period_end,
        }).eq("id", existing.id)
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("gateway_subscription_id", sub.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
