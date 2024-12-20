"use client";

import { Icons } from "@/components/icons";
import { Database } from "@/types/supabase";
import { imageRow, modelRow, sampleRow } from "@/types/utils";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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

  const [model, setModel] = useState<modelRow>(serverModel);
  const [images, setImages] = useState<imageRow[]>(serverImages);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  // Suscripción para cambios en el modelo
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

  // Suscripción para cambios en las imágenes
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
          setImages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(imagesChannel);
    };
  }, [supabase, model.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/astria/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ modelId: model.id })
      });
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Error al generar las imágenes",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Las imágenes se generaron correctamente.",
        });
        // Aquí ya se actualizó has_generated en el servidor y se reflejará vía el canal realtime
        // Si quieres forzar la actualización inmediata:
        setModel((prev) => ({ ...prev, has_generated: true }));
      }
    } catch (error: any) {
      console.error("Error llamando a la API /astria/generate:", error);
      toast({
        title: "Error",
        description: "No se pudieron generar las imágenes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
                    alt="sample"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col w-full lg:w-1/2 rounded-md">
            {model.status === "finished" && !model.has_generated && (
              <div className="mb-4">
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? "Generando..." : "Generar Imágenes"}
                </Button>
              </div>
            )}
            {model.status === "finished" && model.has_generated && (
              <div className="flex flex-1 flex-col gap-2">
                <h1 className="text-xl">Resultados</h1>
                <div className="flex flex-row flex-wrap gap-4">
                  {images.map((image) => (
                    <div key={image.id}>
                      <img
                        src={image.uri}
                        className="rounded-md w-60 object-cover"
                        alt="generada"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(model.status !== "finished") && (
              <p>El modelo aún no está listo. Por favor espera a que finalice el entrenamiento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
