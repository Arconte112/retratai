"use client"
import Link from "next/link";

export default function PacksGalleryZone() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 max-w-md mx-auto">
      <Link 
        href={`/overview/models/train/fotos-profesionales`} 
        className="group relative w-full bg-black rounded-lg overflow-hidden transition-all duration-300 hover:scale-102"
      >
        <div className="aspect-[2/3] relative">
          <img
            src={"/professional.jpeg"}
            alt={"Fotos profesionales"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="text-white w-full p-4 text-lg font-bold text-center capitalize leading-tight bg-black">
          Fotos Profesionales
        </div>
      </Link>
    </div>
  );
}
