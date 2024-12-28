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

const packsIsEnabled = true; // ahora solo una tarjeta, si es tu lógica.

export const dynamic = "force-dynamic";

export default async function Index() {
  if(!packsIsEnabled) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        id="train-model-container"
        className="flex flex-1 flex-col gap-2 px-2"
      >
        <Link href="/overview" className="text-sm w-fit">
          <Button variant={"outline"}>
            <FaArrowLeft className="mr-2" />
            Volver
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Galería</CardTitle>
            <CardDescription>
              Elige el tipo de imágenes que deseas crear. Ahora solo "Fotos profesionales".
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <PacksGalleryZone />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
