import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import HeroSection from "@/components/HeroSection";
import ExplainerSection from "@/components/ExplainerSection";
import PricingSection from "@/components/PricingSection";
import PriceComparisonSection from "@/components/PriceComparisonSection";
import FAQSection from "@/components/FAQSection";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/overview");
  }

  return (
    <article className="flex flex-col items-center w-full">
      <section aria-label="Inicio" className="w-full">
        <HeroSection />
      </section>
      
      <section aria-label="¿Cómo funciona?" className="w-full">
        <ExplainerSection />
      </section>
      
      <section aria-label="Comparación de precios" className="w-full">
        <PriceComparisonSection />
      </section>
      
      <section aria-label="Planes y precios" className="w-full">
        <PricingSection />
      </section>
      
      <section aria-label="Preguntas frecuentes" className="w-full">
        <FAQSection />
      </section>
    </article>
  );
}
