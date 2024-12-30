'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export default function PricingSection() {
  return (
    <div className="w-full max-w-6xl mx-auto mt-16 mb-16 px-4 md:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Planes y Precios
        </h2>
        <p className="mt-4 text-gray-600">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingOptions.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`relative flex flex-col ${option.bgColor} rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            {option.popular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                Más Popular
              </div>
            )}
            
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {option.title}
              </h3>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">{option.price}</span>
                <span className="text-gray-500 ml-1">/crédito</span>
              </div>
              
              <p className="text-gray-600 mb-6">
                {option.description}
              </p>
              
              <div className="space-y-4 mb-8">
                {option.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-center space-x-3">
                    <svg 
                      className="h-5 w-5 text-green-500" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-50 mt-auto">
              <Link href="/login" className="block">
                <Button 
                  className={`w-full py-6 text-lg font-semibold ${
                    option.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                      : ''
                  }`}
                >
                  {option.buttonText}
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const pricingOptions = [
  {
    title: "1 Crédito",
    price: "$12",
    description: "Perfecto para probar el servicio",
    features: [
      "40 Fotos de Alta Calidad",
      "1 Modelo Personalizado",
      "Uso Comercial Incluido",
      "Entrega Inmediata"
    ],
    buttonText: "Comenzar Ahora",
    bgColor: "bg-white",
    popular: false
  },
  {
    title: "3 Créditos",
    price: "$30",
    description: "¡Ahorra $6 USD!",
    features: [
      "120 Fotos de Alta Calidad",
      "3 Modelos Personalizados",
      "Ideal para Cambiar tu Estilo Mensualmente",
      "Perfecto para Productos de tu Marca",
      "Solo $10 USD por Crédito"
    ],
    buttonText: "Elegir Plan",
    bgColor: "bg-white",
    popular: true
  },
  {
    title: "5 Créditos",
    price: "$45",
    description: "¡Máximo Ahorro: $15 USD!",
    features: [
      "200 Fotos de Alta Calidad",
      "5 Modelos Personalizados",
      "Ideal para Campañas Completas",
      "Perfecto para Equipos e Influencers",
      "Solo $9 USD por Crédito"
    ],
    buttonText: "Elegir Plan",
    bgColor: "bg-white",
    popular: false
  }
];
