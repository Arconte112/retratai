'use client';

import { motion } from "framer-motion";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  image: string;
  index: number;
}

export default function StepCard({
  step,
  title,
  description,
  image,
  index,
}: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold">
          {step}
        </div>
      </div>
      
      <div className="p-8 pt-20">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="relative rounded-xl overflow-hidden group">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-auto rounded-xl transform transition-transform duration-300 group-hover:scale-105"
            whileHover={{ scale: 1.02 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </motion.div>
  );
} 