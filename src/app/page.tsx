import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-sky-600">
          RetratAI
        </h1>
        <p className="text-2xl mb-8 text-gray-700 dark:text-gray-300">
          Fotografías profesionales generadas por IA en segundos
        </p>
        <button className="bg-gradient-to-r from-sky-400 to-sky-600 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity">
          Comenzar ahora
        </button>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Características principales
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-sky-500 text-4xl mb-4">✨</div>
            <h3 className="font-bold text-xl mb-2">Calidad profesional</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Fotos de alta resolución listas para usar en cualquier medio
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-sky-500 text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-xl mb-2">Generación instantánea</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Obtén tus fotos en segundos, sin esperas
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="text-sky-500 text-4xl mb-4">🎨</div>
            <h3 className="font-bold text-xl mb-2">Personalización total</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Ajusta cada detalle según tus necesidades
            </p>
          </div>
        </div>
      </section>

      {/* Example Photos Section */}
      <section className="bg-sky-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ejemplos de fotos generadas
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative aspect-square rounded-lg shadow-md overflow-hidden">
              <Image
                src="https://placehold.co/600x600/sky/white?text=Professional+Portrait"
                alt="Professional portrait example"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square rounded-lg shadow-md overflow-hidden">
              <Image
                src="https://placehold.co/600x600/sky/white?text=Business+Photo"
                alt="Business photo example"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square rounded-lg shadow-md overflow-hidden">
              <Image
                src="https://placehold.co/600x600/sky/white?text=Creative+Shot"
                alt="Creative shot example"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Planes y precios
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-xl mb-4">Básico</h3>
            <p className="text-3xl font-bold mb-4">$9.99<span className="text-sm text-gray-600 dark:text-gray-400">/mes</span></p>
            <ul className="space-y-2 mb-8">
              <li>✓ 50 fotos por mes</li>
              <li>✓ Resolución estándar</li>
              <li>✓ Soporte básico</li>
            </ul>
            <button className="w-full bg-sky-900 dark:bg-sky-700 text-white py-2 rounded-full hover:opacity-90 transition-opacity">
              Seleccionar plan
            </button>
          </div>
          <div className="bg-gradient-to-b from-sky-400 to-sky-600 p-8 rounded-xl shadow-lg transform scale-105">
            <h3 className="font-bold text-xl mb-4 text-white">Pro</h3>
            <p className="text-3xl font-bold mb-4 text-white">$24.99<span className="text-sm text-gray-100">/mes</span></p>
            <ul className="space-y-2 mb-8 text-white">
              <li>✓ 200 fotos por mes</li>
              <li>✓ Alta resolución</li>
              <li>✓ Soporte prioritario</li>
              <li>✓ Estilos personalizados</li>
            </ul>
            <button className="w-full bg-white text-sky-600 py-2 rounded-full hover:opacity-90 transition-opacity">
              Seleccionar plan
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-xl mb-4">Empresas</h3>
            <p className="text-3xl font-bold mb-4">$99.99<span className="text-sm text-gray-600 dark:text-gray-400">/mes</span></p>
            <ul className="space-y-2 mb-8">
              <li>✓ Fotos ilimitadas</li>
              <li>✓ Máxima resolución</li>
              <li>✓ Soporte 24/7</li>
              <li>✓ API access</li>
            </ul>
            <button className="w-full bg-sky-900 dark:bg-sky-700 text-white py-2 rounded-full hover:opacity-90 transition-opacity">
              Contactar ventas
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-sky-400 to-sky-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Comienza a crear fotos profesionales hoy
          </h2>
          <p className="mb-8 text-lg">
            Únete a miles de usuarios que ya están usando RetratAI
          </p>
          <button className="bg-white text-sky-600 font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity">
            Prueba gratis por 7 días
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>© 2024 RetratAI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
