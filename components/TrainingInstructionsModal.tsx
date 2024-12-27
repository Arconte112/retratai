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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Instrucciones para Mejores Resultados</DialogTitle>
          <DialogDescription>
            Sigue estas pautas para obtener los mejores resultados en el entrenamiento de tu modelo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Selección de Imágenes:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usa entre 4 y 10 fotos de alta calidad</li>
              <li>Asegúrate que las fotos tengan buena iluminación</li>
              <li>Incluye diferentes ángulos y expresiones faciales</li>
              <li>NO uses fotos borrosas o con múltiples personas</li>
              <li>Usa fotos con fondos simples y variados</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Recomendaciones Adicionales:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Mantén consistencia en la apariencia entre las fotos</li>
              <li>Evita filtros excesivos o efectos especiales</li>
              <li>Incluye primeros planos y fotos de medio cuerpo</li>
              <li>Asegúrate que el rostro sea claramente visible</li>
            </ul>
          </div>
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
          <Button onClick={handleConfirm}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 