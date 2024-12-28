"use client";
import { Button } from "@/components/ui/button";
import { modelRowWithSamples } from "@/types/utils";
import Link from "next/link";
import { useEffect } from "react";
import { FaImages, FaPlus } from "react-icons/fa";
import ModelsTable from "../ModelsTable";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto"
    >
      {serverModels && serverModels.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-row gap-4 w-full justify-between items-center">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Tus Modelos
            </motion.h1>
            <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"}>
              <Button 
                size="default"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Crear Nuevo Modelo
              </Button>
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ModelsTable models={serverModels} />
          </motion.div>
        </div>
      )}
      {serverModels && serverModels.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-gray-200 shadow-sm p-8"
        >
          <FaImages size={64} className="text-blue-500 mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Comienza tu Primer Modelo
          </h1>
          <p className="text-gray-600 mb-8 text-center max-w-md">
            Crea tu primer modelo de IA y genera fotos profesionales en minutos.
          </p>
          <Link href={packsIsEnabled ? "/overview/packs" : "/overview/models/train/raw-tune"}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Crear Nuevo Modelo
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
