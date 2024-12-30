"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaImages, FaUpload, FaTrash } from "react-icons/fa";
import * as z from "zod";
import { fileUploadFormSchema } from "@/types/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import TrainingInstructionsModal from "@/components/TrainingInstructionsModal";
import { upload } from "@vercel/blob/client";
import { motion } from "framer-motion";

type FormInput = z.infer<typeof fileUploadFormSchema>;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

export default function TrainModelZone({ packSlug }: { packSlug: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState(() => {
    if (typeof window !== 'undefined') {
      const hideInstructions = localStorage.getItem("hideTrainingInstructions");
      return hideInstructions !== "true";
    }
    return true;
  });
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormInput>({
    resolver: zodResolver(fileUploadFormSchema),
    defaultValues: {
      name: "",
      gender: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormInput> = () => {
    trainModel();
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: File[] =
        acceptedFiles.filter(
          (file: File) => !files.some((f) => f.name === file.name)
        ) || [];

      if (newFiles.length + files.length < 10) {
        toast({
          title: "Muy pocas imágenes",
          description: "Debes seleccionar entre 10 y 15 imágenes en total.",
          duration: 5000,
        });
        return;
      }

      if (newFiles.length + files.length > 15) {
        toast({
          title: "Demasiadas imágenes",
          description: "Debes seleccionar entre 10 y 15 imágenes en total.",
          duration: 5000,
        });
        return;
      }

      if (newFiles.length !== acceptedFiles.length) {
        toast({
          title: "Nombres de archivo duplicados",
          description:
            "Algunos de los archivos que seleccionaste ya estaban agregados. Se ignoraron.",
          duration: 5000,
        });
      }

      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      const newSize = newFiles.reduce((acc, file) => acc + file.size, 0);

      if (totalSize + newSize > 4.5 * 1024 * 1024) {
        toast({
          title: "Archivos demasiado grandes",
          description: "El tamaño total no puede exceder 4.5MB.",
          duration: 5000,
        });
        return;
      }

      const tooLargeFiles = newFiles.filter((file) => file.size > 4 * 1024 * 1024);
      if (tooLargeFiles.length > 0) {
        toast({
          title: "Archivos demasiado grandes",
          description: "Cada imagen debe ser menor a 4MB.",
          duration: 5000,
        });
        return;
      }

      const nonImageFiles = newFiles.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (nonImageFiles.length > 0) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten imágenes.",
          duration: 5000,
        });
        return;
      }

      setFiles([...files, ...newFiles]);

      toast({
        title: "Imágenes seleccionadas",
        description: "Las imágenes se seleccionaron correctamente.",
        duration: 5000,
      });
    },
    [files, toast]
  );

  const removeFile = useCallback(
    (file: File) => {
      if (files.length - 1 < 10) {
        toast({
          title: "No se puede eliminar",
          description: "Debes mantener al menos 10 imágenes. Puedes reemplazar esta imagen agregando una nueva primero.",
          duration: 5000,
        });
        return;
      }
      
      setFiles(files.filter((f) => f.name !== file.name));
      
      toast({
        title: "Imagen eliminada",
        description: `Se eliminó "${file.name}". Quedan ${files.length - 1} imágenes.`,
        duration: 3000,
      });
    },
    [files, toast]
  );

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    toast({
      title: "Imágenes eliminadas",
      description: "Se eliminaron todas las imágenes correctamente.",
      duration: 3000,
    });
  }, [toast]);

  const trainModel = useCallback(async () => {
    setIsLoading(true);

    const blobUrls = [];

    if (files) {
      for (const file of files) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/astria/train-model/image-upload",
        });
        blobUrls.push(blob.url);
      }
    }

    const payload = {
      urls: blobUrls,
      name: form.getValues("name").trim(),
      pack: packSlug,
      gender: form.getValues("gender"),
    };

    const response = await fetch("/astria/train-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setIsLoading(false);

    if (!response.ok) {
      const responseData = await response.json();
      const responseMessage: string = responseData.message;
      console.error("Something went wrong! ", responseMessage);
      const messageWithButton = (
        <div className="flex flex-col gap-4">
          {responseMessage}
          <a href="/get-credits">
            <Button size="sm">Obtener Créditos</Button>
          </a>
        </div>
      );
      toast({
        title: "Error",
        description: messageWithButton,
        duration: 5000,
      });
      return;
    }

    toast({
      title: "Modelo en cola para entrenamiento",
      description:
        "El modelo se ha puesto en cola. Recibirás un correo cuando esté listo.",
      duration: 5000,
    });

    router.refresh();
    router.push("/overview");
  }, [files, form, packSlug, router, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });

  return (
    <div>
      <TrainingInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Nombre del Modelo</FormLabel>
                    <FormDescription>
                      Pon un nombre descriptivo para identificar tu modelo
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="ej. Fotos de Juan"
                        {...field}
                        className="text-base"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Género
                    </FormLabel>
                    <FormDescription className="text-base text-gray-600">
                      Selecciona el género para optimizar la generación de fotos
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <FormItem className="relative">
                          <FormControl>
                            <RadioGroupItem
                              value="man"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center gap-4 p-6 border-2 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 transition-all">
                            <div className="p-3 bg-blue-100 rounded-xl">
                              <svg 
                                className="w-8 h-8 text-blue-600" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-medium text-gray-900">Hombre</p>
                              <p className="text-sm text-gray-500">Optimizado para fotos masculinas</p>
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="relative">
                          <FormControl>
                            <RadioGroupItem
                              value="woman"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center gap-4 p-6 border-2 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 transition-all">
                            <div className="p-3 bg-purple-100 rounded-xl">
                              <svg 
                                className="w-8 h-8 text-purple-600" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-medium text-gray-900">Mujer</p>
                              <p className="text-sm text-gray-500">Optimizado para fotos femeninas</p>
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <FormLabel className="text-base font-semibold">Imágenes de Muestra</FormLabel>
                <FormDescription>
                  Sube entre 10 y 15 imágenes de la persona
                </FormDescription>
                <div
                  {...getRootProps()}
                  className="mt-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <div className="text-center">
                        <FaUpload className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                        <p className="text-blue-600 font-medium">
                          Suelta las imágenes aquí...
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FaImages className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                          Arrastra y suelta imágenes aquí, o haz clic para seleccionar
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG o JPG (máx. 4MB por imagen)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {files.map((file, index) => (
                      <motion.div
                        key={file.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="relative group"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          className="w-full aspect-square rounded-lg object-cover"
                          alt={file.name}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={() => removeFile(file)}
                          type="button"
                        >
                          <FaTrash className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  {files.length >= 10 && (
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        {files.length} imágenes seleccionadas
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearAllFiles}
                        type="button"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <FaTrash className="w-3 h-3 mr-2" />
                        Eliminar todas
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-end"
          >
            <Button 
              type="submit" 
              size="lg"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2">
                    <FaImages className="w-4 h-4" />
                  </div>
                  Entrenando...
                </>
              ) : (
                <>
                  Entrenar Modelo
                  {stripeIsConfigured && <span className="ml-2 text-white/80">(1 Crédito)</span>}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}
