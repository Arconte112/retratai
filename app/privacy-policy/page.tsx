'use client';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-6">
          Política de Privacidad
        </h1>
        
        <p className="text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Información que Recopilamos
          </h2>
          <p className="mb-4">
            Recopilamos la siguiente información cuando utilizas nuestra plataforma:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Información de la cuenta (email, nombre de usuario)</li>
            <li>Imágenes subidas para entrenamiento de modelos</li>
            <li>Datos de uso y analíticas</li>
            <li>Información técnica (dirección IP, tipo de navegador)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Uso de la Información
          </h2>
          <p className="mb-4">
            Utilizamos la información recopilada para:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Entrenar modelos de IA personalizados</li>
            <li>Comunicarnos contigo sobre tu cuenta</li>
            <li>Garantizar la seguridad de nuestra plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Protección de Datos
          </h2>
          <p className="mb-4">
            Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales. 
            Esto incluye encriptación, acceso restringido y monitoreo regular de nuestros sistemas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Tus Derechos
          </h2>
          <p className="mb-4">
            Tienes derecho a:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Acceder a tus datos personales</li>
            <li>Corregir datos inexactos</li>
            <li>Solicitar la eliminación de tus datos</li>
            <li>Oponerte al procesamiento de tus datos</li>
            <li>Exportar tus datos en un formato portable</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Cookies y Tecnologías Similares
          </h2>
          <p className="mb-4">
            Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el tráfico 
            y personalizar el contenido. Puedes controlar las cookies a través de la configuración de tu navegador.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Contacto
          </h2>
          <p className="mb-4">
            Si tienes preguntas sobre nuestra política de privacidad o el manejo de tus datos, 
            por favor contáctanos a través de nuestro correo de soporte.
          </p>
        </section>
      </div>
    </div>
  );
} 