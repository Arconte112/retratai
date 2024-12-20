import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Replicate from "replicate";
import { randomUUID } from "crypto";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export const dynamic = "force-dynamic";

/**
 * Espera un JSON con:
 * {
 *   "modelId": number,
 *   "prompt": string
 * }
 */
export async function POST(request: Request) {
  const { modelId, prompt } = await request.json();

  if (!modelId || !prompt) {
    return NextResponse.json(
      { message: "Faltan parámetros: modelId, prompt." },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  // Obtener el modelo de la BD
  const { data: model, error: modelError } = await supabase
    .from("models")
    .select("*")
    .eq("id", modelId)
    .eq("user_id", user.id)
    .single();

  if (modelError || !model) {
    return NextResponse.json({ message: "Modelo no encontrado" }, { status: 404 });
  }

  if (model.status !== "finished") {
    return NextResponse.json(
      { message: "El modelo no está terminado de entrenar." },
      { status: 400 }
    );
  }

  // 'modelId' en la DB se refiere al "destination" o al identificador en replicate. 
  // En la versión anterior, el entrenamiento en replicate se hacía con un destination del tipo "arconte112/model_name_uuid".
  // Recuperamos ese valor desde `model.modelId`, que debería contener algo como "arconte112/nombre-modelo-uuid".
  const hf_lora = model.modelId; // Este es el modelo ya entrenado en Replicate.
  

  // Ejecutar el modelo lucataco/flux-dev-lora con nuestro hf_lora
  // Versión usada en el ejemplo del usuario:
  const version = "091495765fa5ef2725a175a57b276ec30dc9d39c22d30410f2ede68a3eab66b3";
  const replicateModel = `lucataco/flux-dev-lora:${version}`;

  const input = {
    prompt: prompt,
    hf_lora: hf_lora
    // Puedes añadir más parámetros según el schema del modelo:
    // Por ejemplo: width, height, guidance_scale, etc. 
  };

  let output;
  try {
    output = await replicate.run(replicateModel, { input });
    // `output` debería ser un array de URLs de imágenes generadas.
  } catch (e: any) {
    console.error("Error generando imágenes con Replicate:", e);
    return NextResponse.json(
      { message: "Error al generar las imágenes." },
      { status: 500 }
    );
  }

  // Guardar las imágenes generadas en la BD
  // Asumimos que output es un array de URLs (webp) generadas por el modelo
  if (!Array.isArray(output)) {
    return NextResponse.json(
      { message: "La respuesta del modelo no es un array de imágenes." },
      { status: 500 }
    );
  }

  const imagesToInsert = output.map((uri) => ({
    modelId: model.id,
    uri,
  }));

  const { error: insertError } = await supabase.from("images").insert(imagesToInsert);

  if (insertError) {
    console.error("Error guardando imágenes en la BD:", insertError);
    return NextResponse.json(
      { message: "Error guardando imágenes en la BD." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Imágenes generadas y guardadas exitosamente.", images: output },
    { status: 200 }
  );
}
