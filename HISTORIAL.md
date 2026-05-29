# Replivo — Historial de Sesión

## Stack
- Next.js 14.2 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth + Base de datos)
- Groq (API gratuita, modelo: `llama-3.1-8b-instant`)
- Stripe SDK v22 (pasarela global)
- MercadoPago SDK (pasarela LATAM)
- PayPal REST API (pasarela global)
- Vercel (deploy gratis)

## Estado actual
- **Deployado en**: https://review-responder-two-psi.vercel.app
- **GitHub**: https://github.com/nodoetico/review-responder (cuenta: nodoetico)
- **Supabase project ref**: `hnhhbsswgocnpkxzmnte`
- **Groq API key**: configurada en .env.local
- **Google Places API**: no configurada (sin tarjeta). Las reseñas se cargan manualmente desde el dashboard.

## Lo que funciona

### Landing page (`/`)
- Hero, beneficios, pricing (detecta moneda por timezone: USD/ARS/MXN/EUR)
- Pricing con selector de pasarela de pago cuando el usuario está logueado
- CTAs a registro
- Botón modo oscuro (arriba a la derecha)
- Logo cambia entre color (claro) y blanco (oscuro) según el tema

### Autenticación
- Registro/login con email y contraseña
- "Confirmar email" deshabilitado en Supabase (registro inmediato)
- Redirección post-login al dashboard
- Trigger SQL que crea automáticamente el perfil en tabla `perfiles` al registrarse

### Dashboard (`/dashboard`)
- Sidebar con navegación: Inicio, Mis locales, Reseñas, Suscripción, Configuración
- Sidebar responsive: en desktop fijo a la izquierda, en mobile overlay con hamburguesa
- Botón modo oscuro en sidebar (desktop) y top bar (mobile)
- Cerrar sesión
- Panel de control muestra resumen + plan actual + botón "Mejorar plan"

### Mis locales (`/dashboard/locales`)
- CRUD de locales con nombre, dirección, google_place_id
- Límite de locales según plan: Gratis (1), Starter (3), Pro (10)
- Muestra contador: `X/Y locales usados`
- Si se alcanza el límite, muestra advertencia amarilla con link a Suscripción
- google_place_id = "pendiente" para locales sin Google Places

### Reseñas (`/dashboard/resenas`)
- Carga manual de reseñas: seleccionar local, autor, rating, texto
- Llama a `/api/generar-respuesta` → Groq AI genera respuesta
- Guarda en tabla `resenas` con `respondida: false`
- Aprobación: botón "Aprobar y publicar" que marca `respondida: true`
- Muestra errores reales de la API en rojo

### Suscripción (`/dashboard/suscripcion`)
- Si el usuario está en plan Gratis:
  - Selector de pasarela de pago (Stripe / MercadoPago / PayPal)
  - Cards con plan Starter ($12/mes) y Pro ($29/mes) con features
  - Botón "Contratar con [Pasarela]" que redirige al checkout
- Si el usuario tiene plan pago:
  - Muestra plan actual, precio, estado, pasarela, próximo cobro
  - Aviso para cambios de plan / cancelación

### Configuración (`/dashboard/configuracion`)
- Editar nombre
- Email (solo lectura)
- Contraseña (solo lectura, enmascarada con `∙∙∙∙∙∙∙∙`)

### Pasarelas de pago (implementadas)

#### Stripe
- **SDK**: `stripe` (v22), `@stripe/stripe-js`
- **Checkout**: `POST /api/checkout/stripe` — crea un customer en Stripe (si no existe), luego crea una sesión de checkout con `mode: "subscription"` y redirige al usuario
- **Webhook**: `POST /api/webhooks/stripe` — maneja:
  - `checkout.session.completed`: crea/actualiza la suscripción en la BD
  - `customer.subscription.updated`: actualiza estado y período
  - `customer.subscription.deleted`: marca como cancelada
- **Plan IDs**: `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO` (crear en Stripe Dashboard > Products)

#### MercadoPago
- **SDK**: `mercadopago`
- **Checkout**: `POST /api/checkout/mercadopago` — crea un `PreApproval` (suscripción recurrente) con `auto_recurring` mensual
- **Webhook**: `POST /api/webhooks/mercadopago` — maneja:
  - `payment` / `subscription_authorized_payment`: actualiza suscripción según estado del pago
  - `subscription_cancelled`: marca como cancelada
- **Flujo**: usuario autoriza en MercadoPago, luego es redirigido de vuelta al dashboard

#### PayPal
- **SDK**: API REST nativa (sin SDK de Node, usa `fetch`)
- **Checkout**: `POST /api/checkout/paypal` — crea una suscripción vía `POST /v1/billing/subscriptions` y devuelve el link de aprobación
- **Webhook**: `POST /api/webhooks/paypal` — maneja:
  - `BILLING.SUBSCRIPTION.ACTIVATED`, `UPDATED`, `PAYMENT.SALE.COMPLETED`: activa/actualiza suscripción
  - `BILLING.SUBSCRIPTION.CANCELLED`: marca como cancelada
- **Verificación**: usa `POST /v1/notifications/verify-webhook-signature` para validar webhooks
- **Plan IDs**: `PAYPAL_PLAN_STARTER`, `PAYPAL_PLAN_PRO` (crear en PayPal Developer > Billing > Plans)

### API endpoints de pago
- `POST /api/checkout/stripe` — body: `{ plan: "starter" | "pro" }` → `{ url }`
- `POST /api/checkout/mercadopago` — body: `{ plan: "starter" | "pro" }` → `{ url }`
- `POST /api/checkout/paypal` — body: `{ plan: "starter" | "pro" }` → `{ url }`
- `POST /api/webhooks/stripe` — webhook Stripe (firma verificada)
- `POST /api/webhooks/mercadopago` — IPN MercadoPago
- `POST /api/webhooks/paypal` — webhook PayPal (firma verificada)
- `GET /api/suscripcion` — devuelve `{ subscription, perfil }` del usuario autenticado

### API endpoints generales
- `POST /api/generar-respuesta` — recibe reseña, llama a Groq, guarda en BD
- `POST /api/scan` — escanea reseñas de Google Places para un local (requiere API key)
- `GET /api/cron` — escanea todos los locales activos (no se usa, plan free no soporta cron)

### Planes y límites
| Plan | Precio | Locales | Reseñas/día |
|------|--------|---------|-------------|
| Gratis | $0 | 1 | 10 |
| Starter | $12/mes | 3 | Ilimitadas |
| Pro | $29/mes | 10 | Ilimitadas |

- Los límites están definidos en `src/types/index.ts` (`PLANES`)
- Enforceados en frontend en `src/app/dashboard/locales/page.tsx`
- Helpers del lado servidor en `src/lib/suscripcion.ts` (`verificarLimiteLocales`, `verificarLimiteResenas`)
- Si se excede el límite, el botón "Agregar local" se deshabilita y muestra advertencia

### Modo oscuro
- Contexto `TemaProvider` + `BotonTema`
- Persiste en localStorage
- Clase `dark` en `<html>` para Tailwind
- Aplica a landing + todas las páginas del dashboard

### Diseño responsive
- Sidebar desktop: `lg:flex lg:w-64`, mobile: overlay con backdrop
- Mobile top bar: menú hamburguesa + logo + tema
- Logo móvil: 72px, centrado con `grid grid-cols-3`
- Logo cambia según tema: color en modo claro, blanco en oscuro
- Pricing responsive

## Base de datos (tablas nuevas)

### `perfiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | Referencia a `auth.users.id` |
| email | TEXT | Email del usuario |
| nombre | TEXT | Nombre del usuario |
| stripe_customer_id | TEXT | ID de customer en Stripe |
| mercadopago_id | TEXT | ID en MercadoPago |
| paypal_id | TEXT | ID en PayPal |
| creado_en | TIMESTAMPTZ | Fecha de creación |
| actualizado_en | TIMESTAMPTZ | Fecha de última actualización |

- Creado automáticamente vía trigger `crear_perfil_al_registrarse` en `auth.users`
- RLS: cada usuario ve/edita solo su propio perfil

### `subscriptions`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | ID único |
| usuario_id | UUID FK | Referencia a `auth.users.id` |
| plan_tier | TEXT | `gratis`, `starter` o `pro` |
| status | TEXT | `active`, `cancelled`, `past_due`, `incomplete`, `trialing` |
| gateway | TEXT | `stripe`, `mercadopago`, `paypal` o NULL |
| gateway_subscription_id | TEXT | ID de la suscripción en la pasarela |
| current_period_start | TIMESTAMPTZ | Inicio del período actual |
| current_period_end | TIMESTAMPTZ | Fin del período actual |
| cancel_at_period_end | BOOLEAN | Si se cancelará al final del período |
| creado_en | TIMESTAMPTZ | Fecha de creación |
| actualizado_en | TIMESTAMPTZ | Fecha de última actualización |

- RLS: cada usuario ve/edita solo su propia suscripción
- Sin suscripción en BD → se considera plan Gratis

## No implementado / Pendiente

### Bloqueado
- Google Places API para escaneo automático (sin tarjeta)

### Pendiente
- Conseguir primeros clientes (outreach directo por Google Maps / WhatsApp / Instagram)
- Dominio personalizado (ej. replivo.com)
- Manejo de `invoice.payment_succeeded` en webhook Stripe (actualmente se usa `customer.subscription.updated`)
- Pruebas de extremo a extremo con tarjetas de prueba en cada pasarela
- Enforce de límite de reseñas por día en frontend (solo existe helper del lado servidor)
- Upgrade/downgrade de plan desde el dashboard (actualmente requiere contacto por email)

## Setup de producción (paso a paso)

### 1. Base de datos
Ejecutar `supabase-add-subscriptions.sql` en el SQL Editor de Supabase.
Esto crea las tablas `perfiles` y `subscriptions`, sus políticas RLS, índices, y el trigger para crear perfil automático al registrarse.

### 2. Variables de entorno
Completar en `.env.local`:

```env
# Stripe - https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PRO=price_xxxxx

# MercadoPago - https://www.mercadopago.com.ar/developers
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...

# PayPal - https://developer.paypal.com/dashboard
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_PLAN_STARTER=P-...
PAYPAL_PLAN_PRO=P-...
PAYPAL_SANDBOX=false
```

### 3. Stripe
1. Crear productos en Stripe Dashboard > Products > Add Product
   - Starter ($12/mes recurrente)
   - Pro ($29/mes recurrente)
2. Copiar los `price_xxxxx` IDs a `.env.local`
3. Configurar webhook en Stripe Dashboard > Developers > Webhooks > Add endpoint
   - URL: `https://review-responder-two-psi.vercel.app/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copiar "Signing secret" (`whsec_...`) a `.env.local`

### 4. MercadoPago
1. Crear aplicación en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Copiar Access Token y Public Key a `.env.local`
3. Configurar Webhook (IPN) en MercadoPago > Configuración > Webhooks
   - URL: `https://review-responder-two-psi.vercel.app/api/webhooks/mercadopago`
   - Eventos: `payment`, `subscription_authorized_payment`, `subscription_cancelled`

### 5. PayPal
1. Crear app en [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Copiar Client ID y Client Secret a `.env.local`
3. Crear planes en PayPal > Billing > Plans
   - Starter ($12/mes), Pro ($29/mes)
   - Copiar los `P-...` IDs a `.env.local`
4. Configurar Webhook en PayPal Developer > Webhooks > Add Webhook
   - URL: `https://review-responder-two-psi.vercel.app/api/webhooks/paypal`
   - Eventos: `BILLING.SUBSCRIPTION.*`, `PAYMENT.SALE.COMPLETED`
   - Copiar Webhook ID a `.env.local`

### 6. Desarrollo local
Para probar webhooks en local, usar [ngrok](https://ngrok.com/):
```bash
ngrok http 3000
```
Luego configurar las URLs de webhook apuntando a `https://xxxx.ngrok.io/api/webhooks/...`

## Dependencias nuevas
- `stripe` (v22) — SDK de Stripe para Node.js
- `@stripe/stripe-js` — SDK de Stripe para el navegador
- `mercadopago` — SDK oficial de MercadoPago

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `src/app/page.tsx` | Landing page |
| `src/app/layout.tsx` | Root layout con TemaProvider |
| `src/app/dashboard/layout.tsx` | Dashboard sidebar + top bar mobile |
| `src/app/dashboard/page.tsx` | Panel de control con resumen + info del plan |
| `src/app/dashboard/locales/page.tsx` | CRUD de locales + límite por plan |
| `src/app/dashboard/resenas/page.tsx` | Carga manual + aprobación de reseñas |
| `src/app/dashboard/configuracion/page.tsx` | Nombre, email, contraseña |
| `src/app/dashboard/suscripcion/page.tsx` | Gestión de suscripción y contratación |
| `src/app/api/generar-respuesta/route.ts` | API → Groq |
| `src/app/api/scan/route.ts` | Escaneo Google Places (require API key) |
| `src/app/api/cron/route.ts` | Cron diario (deshabilitado) |
| `src/app/api/suscripcion/route.ts` | Obtener suscripción del usuario autenticado |
| `src/app/api/checkout/stripe/route.ts` | Crear sesión de checkout Stripe |
| `src/app/api/checkout/mercadopago/route.ts` | Crear preaprobación MercadoPago |
| `src/app/api/checkout/paypal/route.ts` | Crear suscripción PayPal |
| `src/app/api/webhooks/stripe/route.ts` | Webhook Stripe (checkout, subscription, deleted) |
| `src/app/api/webhooks/mercadopago/route.ts` | Webhook MercadoPago (IPN) |
| `src/app/api/webhooks/paypal/route.ts` | Webhook PayPal (con verificación de firma) |
| `src/components/boton-tema.tsx` | Botón toggle modo oscuro |
| `src/components/tema-provider.tsx` | Contexto del tema |
| `src/components/pricing.tsx` | Cards de precios + selector de pasarela + checkout |
| `src/lib/groq.ts` | Cliente Groq AI |
| `src/lib/supabase-client.ts` | Cliente Supabase browser |
| `src/lib/supabase-server.ts` | Cliente Supabase server (cookies) |
| `src/lib/google-places.ts` | Cliente Google Places (requiere API key) |
| `src/lib/stripe.ts` | Cliente Stripe server-side |
| `src/lib/mercadopago.ts` | Cliente MercadoPago server-side |
| `src/lib/paypal.ts` | Cliente PayPal server-side (API REST) |
| `src/lib/suscripcion.ts` | Helpers: obtener suscripción, verificar límites |
| `src/types/index.ts` | Tipos: Local, Resena, Subscription, Perfil, PLANES |
| `public/logo.png` | Logo color (modo claro) |
| `public/logo-blanco.png` | Logo blanco (modo oscuro/sidebar) |
| `supabase-schema.sql` | Schema BD original (locales + resenas) |
| `supabase-add-subscriptions.sql` | Migración BD (perfiles + subscriptions) |
| `vercel.json` | Config Vercel (cron eliminado, no-free) |

## URLs
- Producción: https://review-responder-two-psi.vercel.app
- GitHub: https://github.com/nodoetico/review-responder
- Vercel dashboard: https://vercel.com/buczek-guillermo-sebastians-projects/review-responder
- Supabase dashboard: https://supabase.com/dashboard/project/hnhhbsswgocnpkxzmnte
