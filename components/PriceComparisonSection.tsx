import { Check } from "lucide-react";

const PriceComparisonSection = () => {
  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-8">
      <h2 className="text-3xl font-bold text-center mb-12">
        ¿Por qué elegir fotos con IA?
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Traditional Photography */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Fotógrafo Tradicional</h3>
          <div className="space-y-4">
            <p className="text-3xl font-bold text-gray-900 mb-6">
              $150 - $500+
              <span className="text-base font-normal text-gray-500 ml-2">por sesión</span>
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="text-red-500 mr-2">✕</div>
                <p>Requiere programar cita y desplazarse al estudio</p>
              </div>
              <div className="flex items-start">
                <div className="text-red-500 mr-2">✕</div>
                <p>La sesión puede durar horas</p>
              </div>
              <div className="flex items-start">
                <div className="text-red-500 mr-2">✕</div>
                <p>Espera de días o semanas para recibir las fotos</p>
              </div>
              <div className="flex items-start">
                <div className="text-green-500 mr-2">✓</div>
                <p>Experiencia personalizada</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Photography */}
        <div className="border rounded-lg p-6 bg-blue-50 shadow-sm border-blue-200">
          <h3 className="text-xl font-semibold mb-4">Fotos con IA</h3>
          <div className="space-y-4">
            <p className="text-3xl font-bold text-gray-900 mb-6">
              $20 - $50
              <span className="text-base font-normal text-gray-500 ml-2">por paquete</span>
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
                <p>Genera fotos al instante desde tu casa</p>
              </div>
              <div className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
                <p>Proceso completado en minutos</p>
              </div>
              <div className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
                <p>Múltiples estilos y variaciones</p>
              </div>
              <div className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
                <p>Descarga inmediata en alta calidad</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceComparisonSection; 