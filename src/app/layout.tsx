// ============================================================
// Layout principal de la aplicacion
// ============================================================
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Review Responder - Respondé reseñas automáticamente",
  description: "Nunca más pierdas clientes por no responder reseñas. Respondemos automáticamente por vos.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
