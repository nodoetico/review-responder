import { MercadoPagoConfig, PreApproval, Payment } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 },
})

export const mercadopagoPreApproval = new PreApproval(client)
export const mercadopagoPayment = new Payment(client)

export const PLANES_MP = {
  starter: {
    unit_price: 12,
    title: "Replivo Starter",
    description: "3 locales - Reseñas ilimitadas - Respuestas con IA",
  },
  pro: {
    unit_price: 29,
    title: "Replivo Pro",
    description: "10 locales - Reseñas ilimitadas - Escaneo automático - Soporte prioritario",
  },
}
