"use client";

import { Database } from "@/types/supabase";
import { creditsRow } from "@/types/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export const revalidate = 0;

type ClientSideCreditsProps = {
  creditsRow: creditsRow | null;
};

export default function ClientSideCredits({
  creditsRow,
}: ClientSideCreditsProps) {
  const [credits, setCredits] = useState<creditsRow | null>(creditsRow);

  if (!creditsRow) return <p>Créditos: 0</p>;

  useEffect(() => {
    const channel = supabase
      .channel("realtime credits")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "credits" },
        (payload: { new: creditsRow }) => {
          setCredits(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!credits) return null;

  return <p>Créditos: {credits.credits}</p>;
}
