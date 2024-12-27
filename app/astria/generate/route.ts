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

async function downloadAndUploadImage(imageUrl: string, userId: string, modelId: string) {
  try {
    // Descargar la imagen
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to download image');
    const imageBuffer = await response.arrayBuffer();

    // Generar un nombre único para la imagen
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${userId}/${modelId}/${timestamp}-${randomString}.jpg`;

    // Subir a Supabase Storage
    const { data, error } = await supabaseAdmin
      .storage
      .from('generated-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obtener la URL pública
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('generated-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { modelId} = await request.json();


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

  const finalPrompt = `Professional photo of a ohwx woman TOK in a black suit smiling`;

  const input = {
    prompt: finalPrompt,
    lora_scale: 1,
    num_outputs: 4,
    output_format: "jpg",
    guidance_scale: 1.8,
    output_quality: 75,
    prompt_strength: 0.8,
    num_inference_steps: 40,
  };

  let allImages: string[] = [];

  // Dividimos el "replicateModel" en owner/model:version
  const [ownerModel, version] = replicateModel.split(":");
  if (!version) {
    console.error("La versión del modelo no se pudo extraer correctamente.");
    return NextResponse.json({ message: "Error en el ID del modelo." }, { status: 400 });
  }

  // Realizar 4 llamadas para obtener 16 imágenes
  for (let i = 0; i < 1; i++) {
    console.log(`Iniciando generación de batch ${i + 1}/1`);
    
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
      console.error(`La predicción del batch ${i + 1} falló:`, prediction.error);
      continue; // Continuar con el siguiente batch si este falla
    }

    const output = prediction.output;
    if (Array.isArray(output) && output.length > 0) {
      allImages = [...allImages, ...output];
    }
  }

  if (allImages.length === 0) {
    return NextResponse.json(
      { message: "No se pudieron generar imágenes." },
      { status: 500 }
    );
  }

  const processedImages = await Promise.all(
    allImages.map(async (uri) => {
      const publicUrl = await downloadAndUploadImage(uri, user.id, model.id.toString());
      return {
        modelId: model.id,
        uri: publicUrl || uri, // Usar el URL original como fallback
        original_uri: uri // Guardar el URL original de Replicate
      };
    })
  );

  const imagesToInsert = processedImages.filter(img => img.uri);

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
    { message: "Imágenes generadas y guardadas exitosamente.", images: allImages },
    { status: 200 }
  );
}

