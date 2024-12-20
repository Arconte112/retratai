"use client"
import Link from "next/link";

export default function PacksGalleryZone() {
  // Ahora no se hacen llamadas a Astria, mostramos una tarjeta fija
  return (
    <div className="grid grid-cols-1 gap-4">
      <Link 
        href={`/overview/models/train/fotos-profesionales`} 
        className="w-full h-70 bg-black rounded-md overflow-hidden transition-transform duration-300 hover:scale-105"
      >
        <img
          src={"https://via.placeholder.com/600x400?text=Fotos+Profesionales"}
          alt={"Fotos profesionales"}
          className="w-full h-4/5 object-cover"
        />
        <div className="text-white w-full p-3 text-md font-bold text-center capitalize leading-tight">
          Fotos Profesionales
        </div>
      </Link>
    </div>
  );
}
