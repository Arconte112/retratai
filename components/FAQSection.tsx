'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
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
      
      {faqs.map((category, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">{category.category}</h3>
          <Accordion type="single" collapsible className="w-full">
            {category.items.map((item, itemIndex) => (
              <AccordionItem key={itemIndex} value={`item-${index}-${itemIndex}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
} 