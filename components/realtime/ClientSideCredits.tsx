"use client";

import { Database } from "@/types/supabase";
import { creditsRow } from "@/types/utils";
import { RealtimeChannel } from '@supabase/supabase-js';
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

  useEffect(() => {
    const channel = supabase
      .channel("realtime-credits")
      .on<Database['public']['Tables']['credits']['Row']>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'credits' },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setCredits(null);
            return;
          }
          setCredits(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!credits) return <p>Créditos: 0</p>;

  return <p>Créditos: {credits.credits}</p>;
}
