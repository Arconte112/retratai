'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const faqs: FAQCategory[] = [
    {
      category: "Generales",
      items: [
        {
          question: "¿Qué es este servicio?",
          answer: "Este es un servicio de generación de headshots profesionales utilizando inteligencia artificial. Te permite crear fotos de perfil de alta calidad para uso profesional."
        },
        {
          question: "¿Qué tipo de fotos puedo generar?",
          answer: "Puedes generar headshots profesionales en diferentes estilos, fondos y poses, ideales para LinkedIn, CV, sitios web corporativos y redes sociales profesionales."
        },
        {
          question: "¿Cuántas fotos puedo generar?",
          answer: "Cada crédito te permite generar 40 fotos de alta calidad con un modelo personalizado. Por ejemplo, el plan de 3 créditos te permite generar 120 fotos con 3 modelos diferentes."
        }
      ]
    },
    {
      category: "Técnico",
      items: [
        {
          question: "¿Qué formato tienen las imágenes generadas?",
          answer: "Las imágenes se generan en formato JPG de alta calidad, optimizadas para uso web y profesional."
        },
        {
          question: "¿Puedo editar las fotos después?",
          answer: "Sí, las imágenes generadas son tuyas y puedes editarlas con cualquier software de edición de imágenes."
        },
        {
          question: "¿Qué resolución tienen las imágenes?",
          answer: "Las imágenes se generan en alta resolución, adecuada para uso profesional en línea y para impresión."
        }
      ]
    },
    {
      category: "Privacidad y Seguridad",
      items: [
        {
          question: "¿Qué sucede con mis fotos originales?",
          answer: "Tus fotos originales se utilizan únicamente para generar los headshots y se eliminan automáticamente después del proceso. Manejamos tus datos con estricta confidencialidad y no se comparten con terceros."
        },
        {
          question: "¿Son seguras mis imágenes?",
          answer: "Sí, utilizamos encriptación de extremo a extremo y seguimos las mejores prácticas de seguridad para proteger tus datos e imágenes. Implementamos medidas de seguridad técnicas y organizativas avanzadas."
        },
        {
          question: "¿Puedo eliminar mis datos?",
          answer: "Sí, puedes solicitar la eliminación de tus datos y fotos en cualquier momento. Tus fotos originales se eliminan automáticamente después del proceso de generación."
        }
      ]
    },
    {
      category: "Soporte y Políticas",
      items: [
        {
          question: "¿Qué hago si tengo problemas técnicos?",
          answer: "Si encuentras algún problema técnico, puedes contactar a nuestro equipo de soporte a través del formulario de contacto o enviando un email a info@retratai.com."
        },
        {
          question: "¿Hay reembolsos disponibles?",
          answer: "Los reembolsos solo están disponibles después de una investigación por parte de nuestro equipo que confirme que la calidad de las fotos generadas no cumple con nuestros estándares de calidad. Para solicitar una revisión, contacta a nuestro equipo de soporte."
        },
        {
          question: "¿Cuánto tiempo toma el proceso?",
          answer: "El proceso se divide en dos partes: primero, el entrenamiento del modelo que toma aproximadamente 40 minutos. Una vez listo el modelo, deberás iniciar el proceso de generación de fotos que toma entre 5-10 minutos adicionales. Recibirás notificaciones por email cuando tu modelo esté listo y cuando tus fotos hayan sido generadas."
        }
      ]
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mt-16 mb-16 px-4 md:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Preguntas Frecuentes
        </h2>
        <p className="mt-4 text-gray-600">
          Encuentra respuestas a las preguntas más comunes sobre nuestro servicio
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {category.category}
            </h3>
            <div className="space-y-4">
              {category.items.map((item, itemIndex) => {
                const key = `${categoryIndex}-${itemIndex}`;
                const isOpen = openItems[key];

                return (
                  <motion.div
                    key={itemIndex}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                    initial={false}
                  >
                    <button
                      onClick={() => toggleItem(categoryIndex, itemIndex)}
                      className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-xl"
                    >
                      <span className="font-medium text-gray-900">{item.question}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-blue-500"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 text-gray-600">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 