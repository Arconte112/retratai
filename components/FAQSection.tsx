'use client';

import React, { useState } from 'react';

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
          answer: "El número de fotos que puedes generar dependerá del plan que elijas. Cada sesión te permite generar múltiples variaciones para encontrar la imagen perfecta."
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
          answer: "Tus fotos originales se utilizan únicamente para generar los headshots y se manejan con estricta confidencialidad. No se comparten con terceros."
        },
        {
          question: "¿Son seguras mis imágenes?",
          answer: "Sí, utilizamos encriptación de extremo a extremo y seguimos las mejores prácticas de seguridad para proteger tus datos e imágenes."
        },
        {
          question: "¿Puedo eliminar mis datos?",
          answer: "Sí, puedes solicitar la eliminación de tus datos y fotos en cualquier momento."
        }
      ]
    },
    {
      category: "Soporte",
      items: [
        {
          question: "¿Qué hago si tengo problemas técnicos?",
          answer: "Si encuentras algún problema técnico, puedes contactar a nuestro equipo de soporte a través del formulario de contacto."
        },
        {
          question: "¿Hay reembolsos disponibles?",
          answer: "Nuestra política de reembolso depende del tipo de servicio contratado. Contacta con soporte para más información."
        },
        {
          question: "¿Cómo puedo obtener ayuda adicional?",
          answer: "Para cualquier pregunta adicional, puedes contactarnos a través de nuestro formulario de contacto o enviar un email a support@example.com."
        }
      ]
    }
  ];

  return (
    <div className="w-full max-w-6xl mt-16 mb-16 p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
      
      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex} className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">{category.category}</h3>
          <div className="space-y-2">
            {category.items.map((item, itemIndex) => {
              const key = `${categoryIndex}-${itemIndex}`;
              const isOpen = openItems[key];

              return (
                <div key={itemIndex} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleItem(categoryIndex, itemIndex)}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                  >
                    <span className="font-medium">{item.question}</span>
                    <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 py-3 bg-white">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
} 