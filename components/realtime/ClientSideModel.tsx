"use client";

import { Icons } from "@/components/icons";
import { Database } from "@/types/supabase";
import { imageRow, modelRow, sampleRow } from "@/types/utils";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const revalidate = 0;

type ClientSideModelProps = {
  serverModel: modelRow;
  serverImages: imageRow[];
  samples: sampleRow[];
};

export default function ClientSideModel({
  serverModel,
  serverImages,
  samples,
}: ClientSideModelProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  // Estado local para almacenar el modelo y las imágenes
  const [model, setModel] = useState<modelRow>(serverModel);
  const [images, setImages] = useState<imageRow[]>(serverImages);

  // Suscripción para cambios en el modelo (para actualizar el estado del modelo en tiempo real)
  useEffect(() => {
    const modelChannel = supabase
      .channel("realtime-model")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "models", filter: `id=eq.${model.id}` },
        (payload: { new: modelRow }) => {
          setModel(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(modelChannel);
    };
  }, [supabase, model.id]);

  // Suscripción para cambios en las imágenes (para mostrar nuevas imágenes en tiempo real)
  useEffect(() => {
    const imagesChannel = supabase
      .channel("realtime-images")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "images",
          filter: `modelId=eq.${model.id}`,
        },
        (payload: { new: imageRow }) => {
          // Agregamos la nueva imagen al estado local sin perder las anteriores
          setImages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(imagesChannel);
    };
  }, [supabase, model.id]);

  return (
    <div id="train-model-container" className="w-full h-full">
      <div className="flex flex-col w-full mt-4 gap-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
          {samples && (
            <div className="flex w-full lg:w-1/2 flex-col gap-2">
              <h2 className="text-xl">Training Data</h2>
              <div className="flex flex-row gap-4 flex-wrap">
                {samples.map((sample) => (
                  <img
                    key={sample.id}
                    src={sample.uri}
                    className="rounded-md w-60 h-60 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col w-full lg:w-1/2 rounded-md">
            {model.status === "finished" && (
              <div className="flex flex-1 flex-col gap-2">
                <h1 className="text-xl">Results</h1>
                <div className="flex flex-row flex-wrap gap-4">
                  {images.map((image) => (
                    <div key={image.id}>
                      <img
                        src={image.uri}
                        className="rounded-md w-60 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
