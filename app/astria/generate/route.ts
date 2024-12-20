import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Cliente de servicio de Supabase
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { modelId, gender } = await request.json();

  if (!modelId || !gender) {
    return NextResponse.json(
      { message: "Faltan parámetros: modelId o gender." },
      { status: 400 }
    );
  }

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

  if (model.has_generated) {
    return NextResponse.json(
      { message: "Las imágenes ya se generaron anteriormente para este modelo." },
      { status: 400 }
    );
  }

  const replicateModel = model.modelId as `${string}/${string}:${string}`;
  if (!replicateModel) {
    return NextResponse.json(
      { message: "ID del modelo no válido" },
      { status: 400 }
    );
  }

  const finalPrompt = `profesional foto of ohwx ${gender} TOK`;

  // Cambiamos el output_format a "png"
  const input = {
    prompt: finalPrompt,
    go_fast: false,
    lora_scale: 1,
    megapixels: "1",
    num_outputs: 4,
    aspect_ratio: "1:1",
    output_format: "png",
    guidance_scale: 3,
    output_quality: 80,
    prompt_strength: 0.8,
    extra_lora_scale: 1,
    num_inference_steps: 28,
  };

  console.log("Creando predicción en Replicate con input:", input);

  // Dividimos el "replicateModel" en owner/model:version
  const [ownerModel, version] = replicateModel.split(":");
  if (!version) {
    console.error("La versión del modelo no se pudo extraer correctamente.");
    return NextResponse.json({ message: "Error en el ID del modelo." }, { status: 400 });
  }

  // Iniciar predicción
  let prediction = await replicate.predictions.create({
    version: version,
    input: input
  });

  // Hacer polling hasta que la predicción finalice o falle
  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled"
  ) {
    await new Promise((r) => setTimeout(r, 3000));
    prediction = await replicate.predictions.get(prediction.id);
  }

  if (prediction.status !== "succeeded") {
    console.error("La predicción falló o fue cancelada:", prediction.error);
    return NextResponse.json(
      { message: "Error al generar las imágenes." },
      { status: 500 }
    );
  }

  const output = prediction.output;
  if (!Array.isArray(output) || output.length === 0) {
    console.error("La respuesta del modelo no es un array de imágenes o está vacía:", output);
    return NextResponse.json(
      { message: "La respuesta del modelo no es un array de imágenes o está vacía." },
      { status: 500 }
    );
  }

  const imagesToInsert = output.map((uri) => ({
    modelId: model.id,
    uri,
  }));

  // Insertar las imágenes en la BD
  const { error: insertError } = await supabase
    .from("images")
    .insert(imagesToInsert);

  if (insertError) {
    console.error("Error guardando imágenes en la BD:", insertError);
    return NextResponse.json(
      { message: "Error guardando imágenes en la BD." },
      { status: 500 }
    );
  }

  // Actualizar has_generated a true usando el cliente de servicio
  console.log("Intentando actualizar has_generated a true para el modelo:", modelId);
  console.log("Usuario actual:", user.id);
  console.log("Datos del modelo:", model);

  const { data: updateData, error: updateModelError } = await supabaseAdmin
    .from("models")
    .update({ has_generated: true })
    .eq("id", modelId)
    .select();

  if (updateModelError) {
    console.error("Error actualizando has_generated:", updateModelError);
    return NextResponse.json(
      { message: "Error actualizando el estado del modelo." },
      { status: 500 }
    );
  }
  console.log("Resultado de la actualización:", updateData);

  return NextResponse.json(
    { message: "Imágenes generadas y guardadas exitosamente.", images: output },
    { status: 200 }
  );
}

