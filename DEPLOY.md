# Guía de despliegue - Review Responder

## Stack gratuito
| Servicio | Uso | Costo |
|----------|-----|-------|
| Vercel | Hosting frontend + API | Gratis (100h/mes) |
| Supabase | Base de datos + Auth | Gratis (500MB) |
| Groq | IA para respuestas | Gratis (30 req/s) |
| Google Places | Obtener reseñas | Gratis (100K req/día) |

---

## 1. Supabase (base de datos)

1. Ir a https://supabase.com → "Start your project"
2. Crear una organización (la que quieras)
3. Crear un proyecto, elegir región cercana
4. Esperar a que termine la creación (~2 min)
5. Ir a **Settings → API** y copiar:
   - `Project URL` → será `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Ir a **SQL Editor**, pegar todo el contenido de `supabase-schema.sql` y ejecutar
7. Ir a **Authentication → Settings → General**:
   - Desactivar "Confirm email" (para que registren sin verificar mail)
   - Guardar cambios

---

## 2. Groq (IA gratuita)

1. Ir a https://console.groq.com
2. Iniciar sesión (GitHub o Google)
3. Ir a **API Keys** → "Create API Key"
4. Copiar la key → será `GROQ_API_KEY`
5. No necesita tarjeta de crédito

---

## 3. Google Places API (opcional — podés empezar sin esto)

La app funciona **sin Google Places API**. Podés cargar reseñas manualmente desde el dashboard y la IA genera respuestas igual.

Cuando quieras activar el escaneo automático:

1. Ir a https://console.cloud.google.com
2. Crear un proyecto nuevo (o usar uno existente)
3. Ir a **APIs & Services → Library**
4. Buscar "Places API" y habilitarla
5. Ir a **APIs & Services → Credentials**
6. "Create Credentials" → "API Key"
7. Copiar la key → será `GOOGLE_PLACES_API_KEY`
8. (Opcional) Restringir la key solo a tu dominio en Vercel

---

## 4. Vercel (hosting)

### Opción A: Desde GitHub (recomendado)
1. Crear un repositorio en GitHub
2. En la terminal:
```bash
cd C:\Users\guibu\OneDrive\Desktop\review-responder
git init
git add .
git commit -m "Initial commit"
gh repo create review-responder --public --push
```
3. Ir a https://vercel.com → "Add New Project"
4. Importar el repo de GitHub
5. En "Environment Variables" agregar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
   - `GOOGLE_PLACES_API_KEY`
6. Deployar → ya está andando

### Opción B: Desde CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```
Te va a pedir las variables de entorno interactivamente.

---

## 5. Verificar que funciona

1. Ir a la URL que te dio Vercel (ej: `review-responder.vercel.app`)
2. Registrarte con email y contraseña
3. Agregar un local en "Mis locales"
4. Probar el scan manual: `GET https://tu-dominio.vercel.app/api/scan` (con body: `{ "localId": "id-del-local" }`)
5. Revisar reseñas en el dashboard

---

## 6. CRON automático

El archivo `vercel.json` ya tiene configurado un CRON que escanea reseñas cada día a las 8 AM. En Vercel:

1. Ir a tu proyecto en https://vercel.com
2. Settings → Cron Jobs
3. Verificar que aparece "Daily at 08:00"

En el plan Hobby de Vercel, los CRONs están limitados a 1 ejecución/día, que es justo lo que necesitás.

---

## 7. Próximas mejoras (cuando tengas clientes)

- [ ] Conectar Stripe para cobrar suscripciones
- [ ] Permitir responder directamente desde el dashboard
- [ ] Enviar alertas por email cuando llegue reseña negativa
- [ ] Dashboard con gráficos de evolución de rating
- [ ] Publicación automática en Google Maps (requiere Google My Business API)

---

## Costos escalando

| Clientes | Plan Supabase | Plan Vercel | Costo total |
|----------|--------------|-------------|-------------|
| 0-10     | Gratis       | Gratis      | $0/mes      |
| 10-100   | Pro ($25/mes)| Pro ($20/mes)| $45/mes    |
| 100+     | Team ($75/mes)| Pro ($20/mes)| $95/mes   |
