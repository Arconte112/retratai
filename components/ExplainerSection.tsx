import blur from "/public/blur.png";
import example from "/public/example.png";
import result from "/public/result.png";

export default function ExplainerSection() {
  return (
    <div className="w-full max-w-6xl mt-16 p-8 bg-gray-100 rounded-lg space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">¿Cómo Funciona?</h2>

      {/* Step 1: Upload your images */}
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-3xl font-bold text-blue-600 bg-white border-2 border-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
            1
          </div>
          <h3 className="text-2xl font-semibold">Sube tus fotos</h3>
        </div>
        <p className="text-sm text-gray-600 text-center">
          Sube 4+ selfies de alta calidad: de frente, 1 persona en el marco, sin
          lentes ni sombreros.
        </p>
        <img
          src={example.src}
          alt="Ejemplo de foto con IA"
          className="rounded-lg object-cover w-full md:w-3/4 lg:w-1/2 mx-auto"
        />
      </div>

      {/* Step 2: Train your model */}
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-3xl font-bold text-blue-600 bg-white border-2 border-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
            2
          </div>
          <h3 className="text-2xl font-semibold">Nuestra IA se pone a trabajar</h3>
        </div>
        <p className="text-sm text-gray-600 text-center">
          El proceso de IA toma ~20 minutos. ¡Recibirás un email cuando esté listo!
        </p>
        <img
          src={blur.src}
          alt="Proceso de IA"
          className="rounded-lg object-cover w-full md:w-3/4 lg:w-1/2 mx-auto"
        />
      </div>

      {/* Step 3: Generate images */}
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-3xl font-bold text-blue-600 bg-white border-2 border-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
            3
          </div>
          <h3 className="text-2xl font-semibold">Obtén fotos increíbles</h3>
        </div>
        <p className="text-sm text-gray-600 text-center">
          ¡Una vez que tu modelo esté entrenado, te daremos fotos profesionales increíbles!
        </p>
        <img
          src={result.src}
          alt="Resultado de foto con IA"
          className="rounded-lg object-cover w-full md:w-3/4 lg:w-1/2 mx-auto"
        />
      </div>
    </div>
  );
}
