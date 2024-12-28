import PacksGalleryZone from "@/components/PacksGalleryZone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

const packsIsEnabled = true;

export const dynamic = "force-dynamic";

export default async function Index() {
  if(!packsIsEnabled) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/overview">
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full hover:bg-gray-100/80"
              >
                <FaArrowLeft className="h-4 w-4 text-gray-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Galería de Estilos
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Elige el tipo de fotos que deseas crear
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <PacksGalleryZone />
          </div>
        </div>
      </div>
    </div>
  );
}
