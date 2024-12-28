import Login from "@/app/login/page";
import { Icons } from "@/components/icons";
import ClientSideModel from "@/components/realtime/ClientSideModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function Index({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <Login />;
  }

  const { data: model } = await supabase
    .from("models")
    .select("*")
    .eq("id", Number(params.id))
    .eq("user_id", user.id)
    .single();

  if (!model) {
    redirect("/overview");
  }

  const { data: images } = await supabase
    .from("images")
    .select("*")
    .eq("modelId", model.id);

  const { data: samples } = await supabase.from("samples").select("*").eq("modelId", model.id);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-row items-center justify-between">
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {model.name}
              </h1>
              <Badge
                variant={model.status === "finished" ? "default" : "secondary"}
                className="text-sm font-medium"
              >
                {model.status === "processing" ? "entrenando" : model.status}
                {model.status === "processing" && (
                  <Icons.spinner className="h-3 w-3 animate-spin ml-2 inline-block" />
                )}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              ID: {model.id}
            </Badge>
            <Badge variant="outline" className="text-sm capitalize">
              {model.gender}
            </Badge>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <ClientSideModel samples={samples ?? []} serverModel={model} serverImages={images ?? []} />
        </div>
      </div>
    </div>
  );
}
