import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Replicate from "replicate";
import fetch from "node-fetch";
import AdmZip from "adm-zip";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileTypeFromBuffer } from 'file-type';

export const dynamic = "force-dynamic";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";
const appWebhookSecret = process.env.APP_WEBHOOK_SECRET;

if (!appWebhookSecret) {
  throw new Error("MISSING APP_WEBHOOK_SECRET!");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
}

if (!supabaseServiceRoleKey) {
  throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

if (!process.env.GEMINI_API_KEY) {
  throw new Error("MISSING GEMINI_API_KEY!");
}

// Función para descargar imagen desde URL
async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Función para detectar el MIME type de una imagen
async function detectMimeType(buffer: Buffer): Promise<string> {
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    return fileType?.mime || 'application/octet-stream';
  } catch (error) {
    console.error('Error detecting MIME type:', error);
    return 'application/octet-stream';
  }
}

// Función para generar caption con Gemini
async function generateImageCaption(imageBuffer: Buffer): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
  });

  try {
    const mimeType = await detectMimeType(imageBuffer);
    
    // Create the prompt parts array with image and text
    const prompt = [{
      inlineData: {
        mimeType: mimeType,
        data: imageBuffer.toString('base64')
      }
    }, `You are an expert system in creating detailed descriptions of headshots.
    If the person in the image is a man, start the caption with "a photo of a ohwx man TOK".
    If the person in the image is a woman, start the caption with "a photo of a ohwx woman TOK".
    Focus on clothing, landscape, lighting etc.
    You may describe facial expressions (smiling, angry, etc).
    Do not describe facial features, body details or other identifying characteristics.
    Provide only the caption.`];

    // Generate content with the new prompt format
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating caption:', error);
    return '';
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const images: string[] = payload.urls;
  const type = payload.type;
  const name = payload.name;

  const supabaseRoute = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabaseRoute.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  if (images.length < 4) {
    return NextResponse.json(
      {
        message: "Sube al menos 4 imágenes.",
      },
      { status: 400 }
    );
  }

  if (stripeIsConfigured) {
    const { error: creditError, data: credits } = await supabaseRoute
      .from("credits")
      .select("credits")
      .eq("user_id", user.id);

    if (creditError) {
      console.error({ creditError });
      return NextResponse.json(
        {
          message: "Error obteniendo créditos.",
        },
        { status: 500 }
      );
    }

    if (!credits || credits.length === 0 || credits[0].credits < 1) {
      return NextResponse.json(
        {
          message:
            "No tienes suficientes créditos. Por favor adquiere créditos y vuelve a intentarlo.",
        },
        { status: 402 }
      );
    }
  }

  // Crear el modelo en DB con estado "processing"
  const { error: modelError, data: insertedModel } = await supabaseRoute
    .from("models")
    .insert({
      user_id: user.id,
      name,
      type,
      status: "processing",
    })
    .select("id")
    .single();

  if (modelError) {
    console.error("modelError: ", modelError);
    return NextResponse.json(
      { message: "Error creando el modelo en la BD." },
      { status: 500 }
    );
  }

  const modelId = insertedModel.id;

  // Descargar las imágenes y crear ZIP
  const zip = new AdmZip();
  try {
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      const imgBuffer = await downloadImage(imageUrl);
      zip.addFile(`image_${i}.jpg`, imgBuffer);
      
      // Generar caption con Gemini
      const caption = await generateImageCaption(imgBuffer);
      zip.addFile(`image_${i}.txt`, Buffer.from(caption));
    }
  } catch (e: any) {
    console.error("Error creando ZIP: ", e);
    await supabaseRoute.from("models").delete().eq("id", modelId);
    return NextResponse.json({ message: "Error procesando imágenes." }, { status: 500 });
  }

  // Subir ZIP a Supabase Storage
  const supabaseAdmin = createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  const zipBuffer = zip.toBuffer();
  const zipFileName = `model_${modelId}_${Date.now()}.zip`;

  const { data: storageData, error: storageError } = await supabaseAdmin.storage
    .from("zip")
    .upload(zipFileName, zipBuffer, {
      contentType: "application/zip",
      upsert: true,
    });

  if (storageError) {
    console.error("storageError: ", storageError);
    await supabaseRoute.from("models").delete().eq("id", modelId);
    return NextResponse.json({ message: "Error subiendo zip." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("zip").getPublicUrl(zipFileName);

  // Guardar samples
  const samples = images.map((uri) => ({ modelId, uri }));
  const { error: samplesError } = await supabaseRoute.from("samples").insert(samples);
  if (samplesError) {
    console.error("samplesError: ", samplesError);
  }

  // Crear el modelo en Replicate (privado, gpu-t4)
  const modelNameSuffix = randomUUID();
  const replicateModelName = `${name.replace(/\s+/g, '-').toLowerCase()}-${modelNameSuffix}`;
  
  const replicateApiKey = process.env.REPLICATE_API_TOKEN;
  if (!replicateApiKey) {
    await supabaseRoute.from("models").delete().eq("id", modelId);
    return NextResponse.json({ message: "Missing REPLICATE_API_TOKEN" }, { status: 500 });
  }

  try {
    const createModelResponse = await fetch("https://api.replicate.com/v1/models", {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        owner: "arconte112",
        name: replicateModelName,
        visibility: "private",
        hardware: "gpu-t4"
      }),
    });

    if (!createModelResponse.ok) {
      const errorText = await createModelResponse.text();
      console.error("Error creating model in Replicate:", errorText);
      await supabaseRoute.from("models").delete().eq("id", modelId);
      return NextResponse.json({ message: "Error creando el modelo en Replicate" }, { status: 500 });
    }

    const replicateModelData = await createModelResponse.json();

    // Webhook de entrenamiento
    const trainWebhook = `https://df66-2001-1308-2048-6700-cd12-5b98-fc4d-4ff3.ngrok-free.app/astria/train-webhook?user_id=${user.id}&model_id=${modelId}&webhook_secret=${appWebhookSecret}`;

    // Iniciar el entrenamiento en Replicate
    await replicate.trainings.create(
      "ostris",
      "flux-dev-lora-trainer",
      "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
      {
        destination: `arconte112/${replicateModelName}`,
        input: {
          steps: 2000,
          lora_rank: 16,
          optimizer: "adamw8bit",
          batch_size: 1,
          resolution: "512,768,1024",
          autocaption: false,
          input_images: publicUrl,
          trigger_word: "TOK",
        },
        webhook: trainWebhook,
        webhook_events_filter: ["completed"],
      }
    );

    // Restar créditos si aplica
    if (stripeIsConfigured) {
      const { data: currentCredits, error: currentCreditsError } = await supabaseRoute
        .from("credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (currentCreditsError) {
        console.error({ currentCreditsError });
        return NextResponse.json(
          { message: "Error obteniendo créditos." },
          { status: 500 }
        );
      }

      const newCredits = (currentCredits?.credits ?? 0) - 1;
      const { error: updateCreditError } = await supabaseRoute
        .from("credits")
        .update({ credits: newCredits })
        .eq("user_id", user.id);

      if (updateCreditError) {
        console.error({ updateCreditError });
        return NextResponse.json(
          { message: "Error actualizando créditos." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "success" }, { status: 200 });

  } catch (e: any) {
    console.error("Error iniciando el entrenamiento en Replicate: ", e);
    // rollback del modelo
    await supabaseRoute.from("models").delete().eq("id", modelId);
    return NextResponse.json(
      { message: "Error iniciando el entrenamiento." },
      { status: 500 }
    );
  }
}
