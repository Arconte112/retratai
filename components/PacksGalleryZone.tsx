"use client"
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCamera, FaImage } from "react-icons/fa";

export default function PacksGalleryZone() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link 
          href={`/overview/models/train/fotos-profesionales`} 
          className="group relative block w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200"
        >
          <div className="aspect-[4/5] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <img
              src={"/professional.jpeg"}
              alt={"Fotos profesionales"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <FaCamera className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  16 fotos por sesión
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Fotos Profesionales
              </h3>
              <p className="text-white/80 text-sm">
                Perfectas para LinkedIn, CV y perfiles profesionales
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaImage className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Alta resolución</span>
              </div>
              <motion.div 
                className="text-sm font-medium text-blue-600"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Seleccionar →
              </motion.div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Espacio para futuros packs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden md:flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
      >
        <div className="text-center">
          <div className="mb-4 p-4 bg-white rounded-full inline-block">
            <FaImage className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Más estilos próximamente
          </h3>
          <p className="text-sm text-gray-500">
            Estamos trabajando en nuevos packs de fotos
          </p>
        </div>
      </motion.div>
    </div>
  );
}
