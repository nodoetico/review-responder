const API_URL = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com"

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

export async function paypalCreateSubscription(planId: string, returnUrl: string, cancelUrl: string) {
  const token = await getAccessToken()

  const res = await fetch(`${API_URL}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        brand_name: "Replivo",
        locale: "es-AR",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal create subscription failed: ${err}`)
  }

  return res.json()
}

export async function paypalVerifyWebhook(headers: Record<string, string>, body: string) {
  const token = await getAccessToken()

  const res = await fetch(`${API_URL}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID!,
      webhook_event: JSON.parse(body),
    }),
  })

  if (!res.ok) throw new Error(`PayPal webhook verification failed: ${res.status}`)
  const data = await res.json()
  return data.verification_status === "SUCCESS"
}

export async function paypalGetSubscription(subscriptionId: string) {
  const token = await getAccessToken()

  const res = await fetch(`${API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`PayPal get subscription failed: ${res.status}`)
  return res.json()
}

export const PLANES_PAYPAL = {
  starter: { plan_id: process.env.PAYPAL_PLAN_STARTER! },
  pro: { plan_id: process.env.PAYPAL_PLAN_PRO! },
}
