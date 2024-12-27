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
import { FaImages } from "react-icons/fa";
import * as z from "zod";
import { fileUploadFormSchema } from "@/types/zod";
import { upload } from "@vercel/blob/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import TrainingInstructionsModal from "@/components/TrainingInstructionsModal";

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

      // Validar que el total de imágenes no sea menor a 10
      if (newFiles.length + files.length < 10) {
        toast({
          title: "Muy pocas imágenes",
          description: "Debes seleccionar entre 10 y 15 imágenes en total.",
          duration: 5000,
        });
        return;
      }

      // si el usuario intenta subir más de 15 archivos
      if (newFiles.length + files.length > 15) {
        toast({
          title: "Demasiadas imágenes",
          description: "Debes seleccionar entre 10 y 15 imágenes en total.",
          duration: 5000,
        });
        return;
      }

      // mostrar toast si se encontraron archivos duplicados
      if (newFiles.length !== acceptedFiles.length) {
        toast({
          title: "Nombres de archivo duplicados",
          description:
            "Algunos de los archivos que seleccionaste ya estaban agregados. Se ignoraron.",
          duration: 5000,
        });
      }

      // verificar tamaño total (no más de 4.5MB)
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

      // cada archivo debe ser menor a 4MB
      const tooLargeFiles = newFiles.filter((file) => file.size > 4 * 1024 * 1024);
      if (tooLargeFiles.length > 0) {
        toast({
          title: "Archivos demasiado grandes",
          description: "Cada imagen debe ser menor a 4MB.",
          duration: 5000,
        });
        return;
      }

      // cada archivo debe ser imagen
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
    [files]
  );

  const removeFile = useCallback(
    (file: File) => {
      // Verificar si al eliminar quedarían menos de 10 imágenes
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
    [files]
  );

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    toast({
      title: "Imágenes eliminadas",
      description: "Se eliminaron todas las imágenes correctamente.",
      duration: 3000,
    });
  }, [files]);

  const trainModel = useCallback(async () => {
    setIsLoading(true);

    const blobUrls = [];

    if (files) {
      // Subir cada archivo a Vercel Blob
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
            <Button size="sm">Obtener Cr��ditos</Button>
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
  }, [files]);

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
          className="rounded-md flex flex-col gap-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full rounded-md">
                <FormLabel>Nombre</FormLabel>
                <FormDescription>
                  Pon un nombre para identificar tu modelo.
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="ej. Fotos de Juan"
                    {...field}
                    className="max-w-screen-sm"
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
              <FormItem className="space-y-3">
                <FormLabel>Género</FormLabel>
                <FormDescription>
                  Selecciona el género para la generación de imágenes.
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="man" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Hombre
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="woman" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Mujer
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            {...getRootProps()}
            className=" rounded-md justify-center align-middle cursor-pointer flex flex-col gap-4"
          >
            <FormLabel>Muestras</FormLabel>
            <FormDescription>
              Sube entre 10 y 15 imágenes de la persona.
            </FormDescription>
            <div className="outline-dashed outline-2 outline-gray-100 hover:outline-blue-500 w-full h-full rounded-md p-4 flex justify-center align-middle">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="self-center">Suelta los archivos aquí...</p>
              ) : (
                <div className="flex justify-center flex-col items-center gap-2">
                  <FaImages size={32} className="text-gray-700" />
                  <p className="self-center">
                    Arrastra y suelta archivos, o haz clic para seleccionar.
                  </p>
                </div>
              )}
            </div>
          </div>
          {files.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-4 flex-wrap">
                {files.map((file) => (
                  <div key={file.name} className="flex flex-col gap-1">
                    <img
                      src={URL.createObjectURL(file)}
                      className="rounded-md w-24 h-24 object-cover"
                    />
                    <Button
                      variant="outline"
                      size={"sm"}
                      className="w-full"
                      onClick={() => removeFile(file)}
                      type="button"
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
              {files.length >= 10 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={clearAllFiles}
                  className="w-fit self-end"
                  type="button"
                >
                  Eliminar todas las imágenes
                </Button>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrenar Modelo {stripeIsConfigured && <span className="ml-1">(1 Crédito)</span>}
          </Button>
        </form>
      </Form>
    </div>
  );
}
