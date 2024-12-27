"use client";

import { Icons } from "@/components/icons";
import { Database } from "@/types/supabase";
import { imageRow, modelRow, sampleRow } from "@/types/utils";
import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [model, setModel] = useState<modelRow>(serverModel);
  const [images, setImages] = useState<imageRow[]>(serverImages);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  // Suscripción para cambios en el modelo
  useEffect(() => {
    const modelChannel = supabase
      .channel("realtime-model")
      .on<Database['public']['Tables']['models']['Row']>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'models', filter: `id=eq.${model.id}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            return;
          }
          setModel(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(modelChannel);
    };
  }, [model.id]);

  // Suscripción para cambios en las imágenes
  useEffect(() => {
    const imagesChannel = supabase
      .channel("realtime-images")
      .on<Database['public']['Tables']['images']['Row']>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'images',
          filter: `modelId=eq.${model.id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setImages((prev) => prev.filter(img => img.id !== payload.old?.id));
            return;
          }
          if (payload.eventType === "INSERT") {
            setImages((prev) => [...prev, payload.new]);
          }
          if (payload.eventType === "UPDATE") {
            setImages((prev) => 
              prev.map(img => img.id === payload.new.id ? payload.new : img)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(imagesChannel);
    };
  }, [model.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/astria/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          modelId: model.id
        })
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

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar la imagen",
        variant: "destructive",
      });
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
                  <div className="mb-4 flex flex-col gap-4">
                    <div className="flex flex-row items-center gap-4">
                      <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? "Generando..." : "Generar Imágenes"}
                      </Button>
                    </div>
                  </div>
              )}
            {model.status === "finished" && model.has_generated && (
              <div className="flex flex-1 flex-col gap-2">
                <h1 className="text-xl">Resultados</h1>
                <div className="flex flex-row flex-wrap gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.uri}
                        className="rounded-md w-60 object-cover cursor-pointer transition-transform hover:scale-105"
                        alt="generada"
                        onClick={() => setSelectedImage(image.uri)}
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDownload(image.uri)}
                      >
                        <Icons.download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {model.status !== "finished" && (
              <p>El modelo aún no está listo. Por favor espera a que finalice el entrenamiento.</p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vista previa</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Vista previa"
                className="w-full h-auto rounded-lg"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-4 right-4"
                onClick={() => handleDownload(selectedImage)}
              >
                <Icons.download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
