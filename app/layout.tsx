import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "RetratAI - Fotos Profesionales con Inteligencia Artificial",
  description: "Genera fotos profesionales de alta calidad en minutos usando inteligencia artificial. Ideal para LinkedIn, redes sociales y perfiles profesionales.",
  keywords: "fotos profesionales, inteligencia artificial, headshots, fotos corporativas, linkedin, redes sociales, fotografía profesional, IA",
  authors: [{ name: "RetratAI" }],
  creator: "RetratAI",
  publisher: "RetratAI",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL('https://retratai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RetratAI - Fotos Profesionales con IA',
    description: 'Genera fotos profesionales de alta calidad en minutos usando inteligencia artificial.',
    url: 'https://retratai.com',
    siteName: 'RetratAI',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RetratAI - Fotos Profesionales con IA',
    description: 'Genera fotos profesionales de alta calidad en minutos usando inteligencia artificial.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: any) {
  return (
    <html lang="es">
      <head>
        <JsonLd />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col">
        <section>
          <Suspense
            fallback={
              <div className="flex w-full px-4 lg:px-40 py-4 items-center border-b text-center gap-8 justify-between h-[69px]" />
            }
          >
            <Navbar />
          </Suspense>
        </section>
        <main className="flex flex-1 flex-col items-center py-16">
          {children}
        </main>
        <footer className="w-full border-t py-4">
          <div className="container mx-auto px-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
                Política de Privacidad
              </Link>
              <span className="text-gray-300">|</span>
              <a href="mailto:info@retratai.com" className="text-sm text-gray-600 hover:text-gray-900">
                Soporte
              </a>
            </div>
            <div className="text-sm text-gray-500">
              Contacto: <a href="mailto:info@retratai.com" className="text-gray-600 hover:text-gray-900">info@retratai.com</a>
            </div>
          </div>
        </footer>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
