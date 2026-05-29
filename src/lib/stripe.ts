import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANES_STRIPE = {
  starter: {
    price_id: process.env.STRIPE_PRICE_STARTER!,
  },
  pro: {
    price_id: process.env.STRIPE_PRICE_PRO!,
  },
}
