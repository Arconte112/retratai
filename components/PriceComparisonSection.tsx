'use client';

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const ComparisonCard = ({
  type,
  price,
  priceLabel,
  features,
  direction,
}: {
  type: "traditional" | "ai";
  price: string;
  priceLabel: string;
  features: Array<{ text: string; positive: boolean }>;
  direction: "left" | "right";
}) => {
  const isAI = type === "ai";
  
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-2xl ${
        isAI 
          ? "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100" 
          : "bg-white"
      } p-8 shadow-lg`}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${
        isAI ? "bg-blue-100" : "bg-red-50"
      } rounded-bl-full opacity-50`} />
      
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {isAI ? "Fotos con IA" : "Fotógrafo Tradicional"}
      </h3>
      
      <div className="mb-8">
        <p className="text-4xl font-extrabold text-gray-900">
          {price}
          <span className="text-base font-normal text-gray-500 ml-2">{priceLabel}</span>
        </p>
      </div>

      <div className="space-y-5">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6">
              {feature.positive ? (
                <Check className="h-6 w-6 text-green-500" />
              ) : (
                <X className="h-6 w-6 text-red-500" />
              )}
            </div>
            <p className="text-gray-600">{feature.text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const PriceComparisonSection = () => {
  const traditionalFeatures = [
    { text: "Requiere programar cita y desplazarse al estudio", positive: false },
    { text: "La sesión puede durar horas", positive: false },
    { text: "Espera de días o semanas para recibir las fotos", positive: false },
    { text: "Experiencia personalizada", positive: true }
  ];

  const aiFeatures = [
    { text: "Genera fotos al instante desde tu casa", positive: true },
    { text: "Proceso completado en minutos", positive: true },
    { text: "Múltiples estilos y variaciones", positive: true },
    { text: "Descarga inmediata en alta calidad", positive: true },
    { text: "Ahorra tiempo y dinero", positive: true }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4 md:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ¿Por qué elegir fotos con IA?
        </h2>
        <p className="mt-4 text-gray-600">
          Compara las ventajas de usar nuestra tecnología de IA frente a la fotografía tradicional
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <ComparisonCard
          type="traditional"
          price="$150 - $500+"
          priceLabel="por sesión"
          features={traditionalFeatures}
          direction="left"
        />
        <ComparisonCard
          type="ai"
          price="$20 - $50"
          priceLabel="por paquete"
          features={aiFeatures}
          direction="right"
        />
      </div>
    </section>
  );
};

export default PriceComparisonSection; 