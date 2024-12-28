import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import NavbarClient from "./NavbarClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .single();

  return (
    <NavbarClient 
      userEmail={user?.email ?? null}
      userId={user?.id ?? null}
      credits={credits ? {
        credits: credits.credits,
        user_id: credits.user_id,
        id: credits.id,
        created_at: credits.created_at,
      } : null} 
    />
  );
}
