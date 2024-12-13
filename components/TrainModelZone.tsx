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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaFemale, FaImages, FaMale, FaRainbow } from "react-icons/fa";
import * as z from "zod";
import { fileUploadFormSchema } from "@/types/zod";
import { upload } from "@vercel/blob/client";
import axios from "axios";

type FormInput = z.infer<typeof fileUploadFormSchema>;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

export default function TrainModelZone({ packSlug }: { packSlug: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormInput>({
    resolver: zodResolver(fileUploadFormSchema),
    defaultValues: {
      name: "",
      type: "man",
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

      // if user tries to upload more than 10 files, display a toast
      if (newFiles.length + files.length > 10) {
        toast({
          title: "Demasiadas imágenes",
          description: "No puedes subir más de 10 imágenes.",
          duration: 5000,
        });
        return;
      }

      // display a toast if any duplicate files were found
      if (newFiles.length !== acceptedFiles.length) {
        toast({
          title: "Nombres de archivo duplicados",
          description:
            "Algunos de los archivos que seleccionaste ya estaban agregados. Se ignoraron.",
          duration: 5000,
        });
      }

      // check that in total images do not exceed a combined 4.5MB
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      const newSize = newFiles.reduce((acc, file) => acc + file.size, 0);

      if (totalSize + newSize > 4.5 * 1024 * 1024) {
        toast({
          title: "Archivos demasiado grandes",
          description: "El tamaño total de las imágenes no puede exceder 4.5MB.",
          duration: 5000,
        });
        return;
      }

      // check that each file is less than 4MB
      const tooLargeFiles = newFiles.filter(
        (file) => file.size > 4 * 1024 * 1024
      );
      if (tooLargeFiles.length > 0) {
        toast({
          title: "Archivos demasiado grandes",
          description: "Cada imagen debe ser menor a 4MB.",
          duration: 5000,
        });
        return;
      }

      // check that each file is an image
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
      setFiles(files.filter((f) => f.name !== file.name));
    },
    [files]
  );

  const trainModel = useCallback(async () => {
    setIsLoading(true);
    // Upload each file to Vercel blob and store the resulting URLs
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

    // console.log(blobUrls, "blobUrls");

    const payload = {
      urls: blobUrls,
      name: form.getValues("name").trim(),
      type: form.getValues("type"),
      pack: packSlug
    };

    // Send the JSON payload to the "/astria/train-model" endpoint
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
        "El modelo se ha puesto en cola para entrenamiento. Recibirás un correo electrónico cuando el modelo esté listo para usar.",
      duration: 5000,
    });

    router.push("/");
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });

  const modelType = form.watch("type");

  return (
    <div>
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
                  Déjanos un nombre para que puedas identificarlo fácilmente más tarde.
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="ej. Fotos de Natalie"
                    {...field}
                    className="max-w-screen-sm"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4">
            <FormLabel>Tipo</FormLabel>
            <FormDescription>
              Selecciona el tipo de fotos que deseas generar.
            </FormDescription>
            <RadioGroup
              defaultValue={modelType}
              className="grid grid-cols-3 gap-4"
              value={modelType}
              onValueChange={(value) => {
                form.setValue("type", value);
              }}
            >
              <div>
                <RadioGroupItem
                  value="man"
                  id="man"
                  className="peer sr-only"
                  aria-label="hombre"
                />
                <Label
                  htmlFor="man"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FaMale className="mb-3 h-6 w-6" />
                  Hombre
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="woman"
                  id="woman"
                  className="peer sr-only"
                  aria-label="mujer"
                />
                <Label
                  htmlFor="woman"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FaFemale className="mb-3 h-6 w-6" />
                  Mujer
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="person"
                  id="person"
                  className="peer sr-only"
                  aria-label="unisex"
                />
                <Label
                  htmlFor="person"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FaRainbow className="mb-3 h-6 w-6" />
                  Unisex
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div
            {...getRootProps()}
            className=" rounded-md justify-center align-middle cursor-pointer flex flex-col gap-4"
          >
            <FormLabel>Muestras</FormLabel>
            <FormDescription>
              Sube 4-10 imágenes de la persona para la que quieres generar fotos.
            </FormDescription>
            <div className="outline-dashed outline-2 outline-gray-100 hover:outline-blue-500 w-full h-full rounded-md p-4 flex justify-center align-middle">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="self-center">Suelta los archivos aquí ...</p>
              ) : (
                <div className="flex justify-center flex-col items-center gap-2">
                  <FaImages size={32} className="text-gray-700" />
                  <p className="self-center">
                    Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos.
                  </p>
                </div>
              )}
            </div>
          </div>
          {files.length > 0 && (
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
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrenar Modelo{" "}
            {stripeIsConfigured && <span className="ml-1">(1 Crédito)</span>}
          </Button>
        </form>
      </Form>
    </div>
  );
}
