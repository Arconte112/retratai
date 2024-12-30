'use client';

import { motion } from "framer-motion";
import { FaShieldAlt, FaUserLock, FaCookie, FaUserShield } from "react-icons/fa";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            >
              Política de Privacidad
            </motion.h1>
            <p className="text-gray-600">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-12">
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaUserLock className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Información que Recopilamos
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Recopilamos la siguiente información cuando utilizas nuestra plataforma:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                  <span>Información de la cuenta (email, nombre de usuario)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                  <span>Imágenes generadas por la IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                  <span>Datos de uso y analíticas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                  <span>Información técnica (dirección IP, tipo de navegador)</span>
                </li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4 bg-blue-50 p-4 rounded-lg">
                Las imágenes que subes para el entrenamiento del modelo son eliminadas automáticamente después de completar el proceso de generación.
                Solo almacenamos las imágenes generadas por la IA para que puedas acceder a ellas cuando lo necesites.
              </p>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaShieldAlt className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Uso de la Información
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Utilizamos la información recopilada para:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                  <span>Proporcionar y mejorar nuestros servicios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                  <span>Entrenar modelos de IA personalizados (las imágenes de entrenamiento se eliminan después del proceso)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                  <span>Comunicarnos contigo sobre tu cuenta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                  <span>Garantizar la seguridad de nuestra plataforma</span>
                </li>
              </ul>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaUserShield className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Protección de Datos
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales. 
                Esto incluye:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600 flex-shrink-0" />
                  <span>Encriptación de extremo a extremo para todas las imágenes almacenadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600 flex-shrink-0" />
                  <span>Eliminación automática de imágenes de entrenamiento después de su uso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600 flex-shrink-0" />
                  <span>Acceso restringido a los datos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600 flex-shrink-0" />
                  <span>Monitoreo regular de nuestros sistemas</span>
                </li>
              </ul>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaCookie className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Cookies y Tecnologías Similares
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el tráfico 
                y personalizar el contenido. Puedes controlar las cookies a través de la configuración de tu navegador.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-gray-600 leading-relaxed">
                  Para más información sobre cómo gestionamos tus datos o para ejercer tus derechos, 
                  no dudes en contactarnos a través de{" "}
                  <a 
                    href="mailto:info@retratai.com" 
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    info@retratai.com
                  </a>
                </p>
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 