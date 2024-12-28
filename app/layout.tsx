import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";

export const metadata = {
  title: "RetratAI",
  description: "Genera fotos profesionales en minutos usando IA",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: any) {
  return (
    <html lang="es">
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
          <div className="container mx-auto px-4 flex justify-center">
            <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
              Política de Privacidad
            </Link>
          </div>
        </footer>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
