"use client";
import { Button } from "@/components/ui/button";
import { modelRowWithSamples } from "@/types/utils";
import Link from "next/link";
import { useEffect } from "react";
import { FaImages } from "react-icons/fa";
import ModelsTable from "../ModelsTable";
import { useRouter } from "next/navigation";

const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export const revalidate = 0;

type ClientSideModelsListProps = {
  serverModels: modelRowWithSamples[] | [];
};

export default function ClientSideModelsList({
  serverModels,
}: ClientSideModelsListProps) {
  const router = useRouter();

  useEffect(() => {
    // Refrescar la página cada 10 segundos para actualizar la lista de modelos
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div id="train-model-container" className="w-full">
      {serverModels && serverModels.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4 w-full justify-between items-center text-center">
            <h1>Tus modelos</h1>
            <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"} className="w-fit">
              <Button size={"sm"}>
                Entrenar modelo
              </Button>
            </Link>
          </div>
          <ModelsTable models={serverModels} />
        </div>
      )}
      {serverModels && serverModels.length === 0 && (
        <div className="flex flex-col gap-4 items-center">
          <FaImages size={64} className="text-gray-500" />
          <h1 className="text-2xl">
            Comienza entrenando tu primer modelo.
          </h1>
          <div>
            <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"}>
              <Button size={"lg"}>Entrenar modelo</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
