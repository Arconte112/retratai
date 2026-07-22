# RetratAI

![RetratAI — AI fine-tuning SaaS](docs/cover.jpg)

RetratAI is a SaaS product for training personalized AI models from selfies and generating professional portrait sessions while preserving the user's identity.

## Product

![RetratAI model dashboard](docs/screenshot.png)

RetratAI provides a complete workflow for personalized image generation:

- Authentication and personal workspace.
- Guided upload and validation of training images.
- Fine-tuning of personal identity models.
- Credit-based portrait generation.
- Model status tracking and private galleries.
- Stripe billing and email notifications.

## Main flow

1. Create an account and access the dashboard.
2. Upload a curated set of personal photos.
3. Configure and start the model training process.
4. Track the model until it is ready.
5. Generate, review and download professional portraits.

## Technology

RetratAI is built with Next.js, TypeScript, Supabase, Astria, Stripe, Vercel Blob, Resend, Tailwind CSS and shadcn/ui.

## Local development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Create the required local environment file before running integrations such as authentication, training, storage, payments and email delivery.
