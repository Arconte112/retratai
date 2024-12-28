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
    <div className="flex flex-col items-center">
      <HeroSection />
      <ExplainerSection />
      <PriceComparisonSection />
      <PricingSection />
      <FAQSection />
    </div>
  );
}
