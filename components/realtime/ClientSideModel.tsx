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
import { motion } from "framer-motion";

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
        const newImages = data.images.map((uri: string) => ({
          id: Math.random().toString(),
          modelId: model.id,
          uri: uri,
          original_uri: uri
        }));
        
        setImages((prev) => [...prev, ...newImages]);
        setModel((prev) => ({ ...prev, has_generated: true }));

        toast({
          title: "Éxito",
          description: "Las imágenes se generaron correctamente.",
        });
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <div className="flex flex-col w-full mt-4 gap-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {samples && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex w-full lg:w-1/2 flex-col gap-4"
            >
              <h2 className="text-xl font-semibold text-gray-800">Datos de Entrenamiento</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {samples.map((sample, index) => (
                  <motion.div
                    key={sample.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <img
                      src={sample.uri}
                      className="rounded-lg w-full aspect-square object-cover shadow-sm hover:shadow-md transition-shadow duration-200"
                      alt="muestra"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col w-full lg:w-1/2 rounded-lg"
          >
            {model.status === "finished" && !model.has_generated && (
              <div className="mb-4 flex flex-col gap-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Generar Imágenes
                </h2>
                <div className="flex flex-row items-center gap-4">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      "Generar Imágenes"
                    )}
                  </Button>
                </div>
                {isGenerating && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-blue-800 font-medium">Este proceso tomará aproximadamente 10 minutos.</p>
                    <p className="text-blue-600 mt-1">Tómate un café mientras tanto, te notificaremos por correo cuando estén listas.</p>
                  </div>
                )}
              </div>
            )}
            {model.status === "finished" && model.has_generated && (
              <div className="flex flex-1 flex-col gap-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resultados
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <motion.div 
                      key={image.id} 
                      className="relative group"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <img
                        src={image.uri}
                        className="rounded-lg w-full aspect-square object-cover shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                        alt="generada"
                        onClick={() => setSelectedImage(image.uri)}
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white shadow-md"
                        onClick={() => handleDownload(image.uri)}
                      >
                        <Icons.download className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {model.status !== "finished" && (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                <Icons.spinner className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600 text-center">
                  El modelo aún está en entrenamiento. Por favor espera a que finalice.
                </p>
              </div>
            )}
          </motion.div>
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
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white shadow-md"
                onClick={() => handleDownload(selectedImage)}
              >
                <Icons.download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
