'use client';

import blur from "/public/blur.png";
import example from "/public/example.png";
import result from "/public/result.png";
import StepCard from "./StepCard";

export default function ExplainerSection() {
  const steps = [
    {
      step: 1,
      title: "Sube tus fotos",
      description: "Sube 10+ selfies de alta calidad: de frente, 1 persona en el marco, sin lentes ni sombreros. Cuanto mejor sea la calidad de tus fotos, mejores serán los resultados.",
      image: example.src
    },
    {
      step: 2,
      title: "Nuestra IA se pone a trabajar",
      description: "Nuestro modelo de IA analiza tus fotos y aprende tus características únicas. El proceso toma ~40 minutos y recibirás una notificación por email cuando esté listo.",
      image: blur.src
    },
    {
      step: 3,
      title: "Obtén fotos increíbles",
      description: "¡Listo! Obtén fotos profesionales de alta calidad en diferentes estilos y poses. Perfectas para LinkedIn, CV, redes sociales y más.",
      image: result.src
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4 md:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ¿Cómo Funciona?
        </h2>
        <p className="mt-4 text-gray-600">
          Obtén fotos profesionales en tres simples pasos
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <StepCard
            key={step.step}
            step={step.step}
            title={step.title}
            description={step.description}
            image={step.image}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
