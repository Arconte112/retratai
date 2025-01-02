import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { FaCamera, FaImage, FaLightbulb, FaEye } from "react-icons/fa";

interface TrainingInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrainingInstructionsModal({
  isOpen,
  onClose,
}: TrainingInstructionsModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideTrainingInstructions", "true");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Instrucciones para Mejores Resultados
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Sigue estas pautas para obtener los mejores resultados en el entrenamiento de tu modelo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCamera className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Selección de Imágenes</h4>
            </div>
            <ul className="grid gap-2 pl-11">
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                <span>Usa entre 10 y 15 fotos de alta calidad</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                <span>Asegúrate que las fotos tengan buena iluminación</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                <span>Incluye diferentes ángulos y expresiones faciales</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                <span>NO uses fotos borrosas o con múltiples personas</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                <span>Usa fotos con fondos simples y variados</span>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaLightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Recomendaciones Importantes</h4>
            </div>
            <ul className="grid gap-2 pl-11">
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                <span>Mantén consistencia en la apariencia entre las fotos</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                <span>Evita filtros excesivos o efectos especiales</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                <span>Incluye primeros planos y fotos de medio cuerpo</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                <span>Asegúrate que el rostro sea claramente visible</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                <span>La persona debe estar mirando directamente a la cámara</span>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <FaEye className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Consejo Pro</span>
            </div>
            <p className="text-gray-600 pl-8">
              Cuanto mejor sea la calidad y variedad de tus fotos de entrenamiento, mejores serán los resultados generados por la IA.
            </p>
          </motion.div>
        </div>

        <DialogFooter className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dontShow"
              checked={dontShowAgain}
              onCheckedChange={(checked: boolean | "indeterminate") => setDontShowAgain(checked as boolean)}
            />
            <label
              htmlFor="dontShow"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              No volver a mostrar
            </label>
          </div>
          <Button 
            onClick={handleConfirm}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 