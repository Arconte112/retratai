# RetratAI

RetratAI es un SaaS para generar retratos profesionales con IA. El proyecto incluye todo el flujo de producto: onboarding de usuarios con Supabase Auth, entrenamiento de modelos personalizados, generación de headshots sobre Replicate y monetización mediante Stripe. Está pensado como una base realista para lanzar un negocio de fotos profesionales creadas por IA.

![RetratAI portfolio cover](docs/cover.jpg)

Portfolio cover generated for presentation. Runtime screenshot:

![RetratAI screenshot](docs/screenshot.png)

## ✨ Funcionalidades clave
- **Autenticación y créditos**: registro con magic link (Supabase) y sistema de créditos administrado desde PostgreSQL.
- **Entrenamiento de modelos**: subida de datasets, orquestación de entrenamiento y seguimiento vía webhooks (`/astria/train-webhook`).
- **Generación de imágenes**: integración directa con la SDK de Replicate para crear retratos en lote.
- **Checkout y facturación**: planes y paquetes de créditos con Stripe (webhooks incluidos).
- **Notificaciones**: soporte para avisar por email cuando los headshots están listos (Resend opcional).
- **Dashboard completo**: estado de entrenamientos, galerías, packs de estilos y administración de créditos.

## 🧱 Stack
- **Frontend**: Next.js 13 (App Router), React, Tailwind + shadcn/ui, Framer Motion.
- **Backend**: Next.js Route Handlers, Supabase (DB/Auth/Storage), Vercel Blob.
- **IA**: Replicate (entrenamiento y generación FLUX), Gemini (captions opcional).
- **Pagos**: Stripe (checkout, webhooks, créditos).
- **Infra**: Vercel / Docker, Resend (email opcional).

## ⚙️ Variables de entorno principales
| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Proyecto Supabase (auth + datos). |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service-role para mutaciones de server (webhooks, entrenamientos). |
| `RETRATAI_PACKS_API_KEY` | Token para consultar packs de estilos (API interna). |
| `RETRATAI_PACKS_API_URL` | Endpoint de la API de packs (por defecto `https://api.astria.ai`). |
| `PACK_QUERY_TYPE` | `users`, `gallery` o `both` para la API de packs. |
| `NEXT_PUBLIC_TUNE_TYPE` | Define el modo de entrenamiento en la UI (`packs` o `custom`). |
| `REPLICATE_API_TOKEN` | Token de Replicate para entrenar y generar. |
| `APP_WEBHOOK_SECRET` | Secreto utilizado en webhooks internos. |
| `GEMINI_API_KEY` | Clave de Gemini (autocaption opcional). |
| `NEXT_PUBLIC_APP_URL` | Base URL del despliegue (para callbacks). |
| `NEXT_PUBLIC_STRIPE_IS_ENABLED` | `true` para habilitar Stripe en UI. |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Credenciales privadas de Stripe. |
| `STRIPE_PRICE_ID_ONE_CREDIT`, `STRIPE_PRICE_ID_THREE_CREDITS`, `STRIPE_PRICE_ID_FIVE_CREDITS` | IDs de precios configurados en Stripe. |
| `RESEND_API_KEY` | Opcional, envía correos cuando finaliza el entrenamiento. |

> Consulta `supabase/` para el esquema SQL de tablas (`models`, `samples`, `credits`, etc.).

## 🚀 Cómo ejecutar localmente
1. **Clona el repo** y crea tu archivo `.env.local` con las variables anteriores.
2. **Instala dependencias**:
   ```bash
   npm install
   ```
3. **Inicializa Supabase** (opcional):
   ```bash
   supabase init
   supabase db start
   supabase db reset
   ```
4. **Ejecuta el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   La app estará disponible en `http://localhost:3000`.
5. **Configura webhooks**:
   - `https://tu-app.com/astria/train-webhook` para entrenamientos.
   - `https://tu-app.com/stripe/subscription-webhook` para Stripe.

## 🧭 Flujo general
1. Usuario crea sesión → se asignan créditos iniciales.
2. Sube fotos para entrenar → se empaquetan y guardan en Supabase Storage.
3. RetratAI crea un modelo FLUX en Replicate y monitorea el estado vía webhook.
4. Cuando el entrenamiento termina, se descuentan créditos y se notifica al usuario.
5. Con el modelo listo, el usuario genera headshots desde el dashboard (cada lote consume créditos).
6. Puede comprar más créditos a través de Stripe (paquetes 1/3/5 créditos).

## 🛣 Roadmap sugerido
- Editor para recortar / validar fotos antes de entrenar.
- Publicar modelos como “packs” compartidos por la comunidad.
- Modo agencia (multi-tenant con subdominios por cliente).
- Reportes y métricas (créditos consumidos, cohortes, etc.).

## 🤝 Contribuciones
1. Haz un fork y crea una rama feature/.
2. Ejecuta `npm run lint` antes de abrir el PR.
3. Describe qué problema resuelves y cómo probarlo.

## 📄 Licencia
MIT © Rainier Alejandro.
