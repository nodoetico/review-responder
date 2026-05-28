import type { Metadata } from "next"
import "./globals.css"
import { TemaProvider } from "@/components/tema-provider"

export const metadata: Metadata = {
  title: "Replivo - Respondé reseñas automáticamente",
  description: "Nunca más pierdas clientes por no responder reseñas. Respondemos automáticamente por vos.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <TemaProvider>{children}</TemaProvider>
      </body>
    </html>
  )
}
