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

  // Array de prompts para diferentes estilos de fotos profesionales
  const prompts = [
    `Professional headshot of a ohwx ${model.gender} TOK in refined business suit, relaxed yet authoritative stance, contemporary office interior with soft bokeh, executive atmosphere, optimal LinkedIn profile, cinematic lighting`,
    `High-end corporate portrait of a ohwx ${model.gender} TOK wearing sophisticated tailored blazer, authentic expression, minimalist office backdrop, urban professional setting, personal branding focus, dramatic studio illumination`,
    `Premium business portrait of a ohwx ${model.gender} TOK in modern business wear, engaging pose, sleek glass office background, tech startup environment, ideal for digital presence, refined lighting setup`,
    `Executive photograph of a ohwx ${model.gender} TOK in premium suit and tie, natural leadership pose, elegant office setting with depth, upscale corporate ambiance, perfect for business profiles, controlled studio lights`,
    `Modern business portrait of a ohwx ${model.gender} TOK in high-end attire, genuine confident expression, architectural office elements blurred, contemporary workplace setting, professional marketing use, balanced lighting`
  ];

  // Configuración base para la generación
  const baseInput = {
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
    return NextResponse.json({ message: "Error en el ID del modelo." }, { status: 400 });
  }

  // Realizar 10 batches de generación (2 por cada prompt)
  for (let i = 0; i < 10; i++) {
    // Seleccionar el prompt basado en el batch actual (cambia cada 2 batches)
    const promptIndex = Math.floor(i / 2);
    const currentPrompt = prompts[promptIndex];
    
    // Combinar la configuración base con el prompt actual
    const input = {
      ...baseInput,
      prompt: currentPrompt,
    };
    
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
        uri: publicUrl || uri,
        original_uri: uri
      };
    })
  );

  const imagesToInsert = processedImages.filter(img => img.uri);

  // Insertar las imágenes en la BD
  const { error: insertError } = await supabase
    .from("images")
    .insert(imagesToInsert);

  if (insertError) {
    return NextResponse.json(
      { message: "Error guardando imágenes en la BD." },
      { status: 500 }
    );
  }

  // Enviar correo de notificación
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);
      
      const emailData = {
        from: "info@retratai.com",
        to: user.email ?? "",
        subject: "¡Tus headshots profesionales están listos! 📸",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a365d; margin-bottom: 20px;">¡Tus headshots están listos! 🎉</h1>
            
            <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
              ¡Genial! Hemos terminado de generar tus headshots profesionales personalizados. 
              Hemos creado una variedad de estilos y poses diferentes para que puedas elegir los que mejor 
              representen tu imagen profesional.
            </p>

            <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 15px; margin: 20px 0;">
              <p style="color: #2d3748; font-size: 16px; margin: 0;">
                <strong>Detalles de tu generación:</strong><br>
                • Múltiples estilos profesionales<br>
                • Diferentes poses y ángulos<br>
                • Fondos y ambientes variados<br>
                • Alta calidad optimizada para redes profesionales
              </p>
            </div>

            <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
              Para ver y descargar tus headshots:
            </p>

            <div style="margin: 30px 0; text-align: center;">
              <a href="https://retratai.com/overview" 
                 style="background: linear-gradient(to right, #2563eb, #7c3aed); 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: bold;">
                Ver Mis Headshots
              </a>
            </div>

            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              ¿Necesitas ayuda? Responde a este correo y estaremos encantados de asistirte.
            </p>
          </div>
        `,
      };
      
      await resend.emails.send(emailData);
    } catch (e: any) {
      // Error silently handled
    }
  }

  const { data: updateData, error: updateModelError } = await supabaseAdmin
    .from("models")
    .update({ has_generated: true })
    .eq("id", modelId)
    .select();

  if (updateModelError) {
    return NextResponse.json(
      { message: "Error actualizando el estado del modelo." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Imágenes generadas y guardadas exitosamente.", images: allImages },
    { status: 200 }
  );
}

