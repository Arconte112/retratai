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
    console.log('Iniciando suscripción de créditos en tiempo real...');
    const channel = supabase
      .channel("realtime-credits")
      .on<Database['public']['Tables']['credits']['Row']>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'credits' },
        (payload) => {
          console.log('Evento de créditos recibido:', {
            tipo: payload.eventType,
            datos: payload.new
          });
          if (payload.eventType === "DELETE") {
            console.log('Créditos eliminados');
            setCredits(null);
            return;
          }
          console.log('Actualizando créditos:', payload.new);
          setCredits(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Estado de la suscripción:', status);
      });

    return () => {
      console.log('Limpiando suscripción de créditos...');
      supabase.removeChannel(channel);
    };
  }, []);

  if (!credits) return <p>Créditos: 0</p>;

  return <p>Créditos: {credits.credits}</p>;
}
