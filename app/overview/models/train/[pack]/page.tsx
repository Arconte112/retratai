import TrainModelZone from "@/components/TrainModelZone";
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

const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export const dynamic = "force-dynamic";

export default async function Index({ params }: { params: { pack : string } }) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={packsIsEnabled ? "/overview/packs" : "/overview"}>
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
                Entrenar Nuevo Modelo
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Configura y entrena tu modelo de IA personalizado
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-8">
            <TrainModelZone packSlug={params.pack} />
          </div>
        </div>
      </div>
    </div>
  );
}
