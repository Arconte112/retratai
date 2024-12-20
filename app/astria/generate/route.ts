import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export const dynamic = "force-dynamic";

/**
 * Espera un JSON con:
 * {
 *   "modelId": number
 * }
 * Ahora el prompt será fijo: "profesional foto of TOK"
 */
export async function POST(request: Request) {
  const { modelId } = await request.json();

  if (!modelId) {
    return NextResponse.json(
      { message: "Faltan parámetros: modelId." },
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
    console.error("Error obteniendo modelo:", modelError);
    return NextResponse.json({ message: "Modelo no encontrado" }, { status: 404 });
  }

  if (model.status !== "finished") {
    return NextResponse.json(
      { message: "El modelo no está terminado de entrenar." },
      { status: 400 }
    );
  }

  // model.modelId ahora tiene la versión completa del modelo en replicate, por ejemplo:
  // "arconte112/dwafwafwad-580a95af-4c03-45fc-92e8-51ac0acd2203:6e552f97af34e088d0b0a69fbfcfcc2c329cd1eb9f23b49620473882d8d2be72"
  const replicateModel = model.modelId as `${string}/${string}:${string}`;
  if (!replicateModel) {
    return NextResponse.json(
      { message: "ID del modelo no válido" },
      { status: 400 }
    );
  }
  const finalPrompt = "profesional foto of TOK";

  // Parámetros según la doc del modelo
  const input = {
    prompt: finalPrompt,
    model: "dev",
    go_fast: false,
    lora_scale: 1,
    megapixels: "1",
    num_outputs: 8,
    aspect_ratio: "1:1",
    output_format: "webp",
    guidance_scale: 3,
    output_quality: 80,
    prompt_strength: 0.8,
    extra_lora_scale: 1,
    num_inference_steps: 28
  };

  console.log("Llamando a replicate.run() con input:", input);

  let output;
  try {
    output = await replicate.run(replicateModel, { input });
    console.log("Output de replicate.run():", output);
  } catch (e: any) {
    console.error("Error generando imágenes con Replicate:", e);
    return NextResponse.json(
      { message: "Error al generar las imágenes." },
      { status: 500 }
    );
  }

  // Verifica el output
  if (!Array.isArray(output) || output.length === 0) {
    console.error("El modelo devolvió un resultado vacío o no es un array. Output:", output);
    return NextResponse.json(
      { message: "La respuesta del modelo no es un array de imágenes o está vacía." },
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
