"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { Database } from "@/types/supabase";
import { Icons } from "./icons";
import { useRouter } from "next/navigation";
import { modelRowWithSamples } from "@/types/utils";
import { motion } from "framer-motion";

type ModelsTableProps = {
  models: modelRowWithSamples[];
};

export default function ModelsTable({ models }: ModelsTableProps) {
  const router = useRouter();
  const handleRedirect = (id: number) => {
    router.push(`/overview/models/${id}`);
  };

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white">
      {/* Vista móvil */}
      <div className="block lg:hidden">
        {models?.map((model, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            key={model.modelId}
            onClick={() => handleRedirect(model.id)}
            className="cursor-pointer p-4 border-b last:border-b-0 hover:bg-gray-50/50 transition-colors duration-200"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                  <span className="font-medium">{model.name}</span>
                </div>
                <Badge
                  className="flex gap-2 items-center w-min font-medium text-xs"
                  variant={
                    model.status === "finished" 
                      ? "default" 
                      : model.status === "processing"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {model.status === "processing" ? "entrenando" : model.status === "finished" ? "completado" : model.status}
                  {model.status === "processing" && (
                    <Icons.spinner className="h-3 w-3 animate-spin" />
                  )}
                </Badge>
              </div>
              <div className="flex gap-2 flex-shrink-0 items-center">
                {model.samples.slice(0, 3).map((sample) => (
                  <Avatar key={sample.id} className="w-8 h-8 border-2 border-white shadow-sm">
                    <AvatarImage src={sample.uri} className="object-cover" />
                  </Avatar>
                ))}
                {model.samples.length > 3 && (
                  <Badge variant="outline" className="rounded-full h-8 w-8 flex items-center justify-center border-2 text-xs">
                    +{model.samples.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vista desktop */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Muestras</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models?.map((model, index) => (
              <motion.tr
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                key={model.modelId}
                onClick={() => handleRedirect(model.id)}
                className="cursor-pointer h-16 hover:bg-gray-50/50 transition-colors duration-200"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                    {model.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <Badge
                      className="flex gap-2 items-center w-min font-medium"
                      variant={
                        model.status === "finished" 
                          ? "default" 
                          : model.status === "processing"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {model.status === "processing" ? "entrenando" : model.status === "finished" ? "completado" : model.status}
                      {model.status === "processing" && (
                        <Icons.spinner className="h-3 w-3 animate-spin" />
                      )}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-shrink-0 items-center">
                    {model.samples.slice(0, 3).map((sample) => (
                      <Avatar key={sample.id} className="w-10 h-10 border-2 border-white shadow-sm">
                        <AvatarImage src={sample.uri} className="object-cover" />
                      </Avatar>
                    ))}
                    {model.samples.length > 3 && (
                      <Badge variant="outline" className="rounded-full h-10 w-10 flex items-center justify-center border-2">
                        +{model.samples.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
