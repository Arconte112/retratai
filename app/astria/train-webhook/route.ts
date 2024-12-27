import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appWebhookSecret = process.env.APP_WEBHOOK_SECRET;

if (!supabaseUrl) {
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
}

if (!supabaseServiceRoleKey) {
  throw new Error("MISSING SUPABASE_SERVICE_ROLE_KEY!");
}

if (!appWebhookSecret) {
  throw new Error("MISSING APP_WEBHOOK_SECRET!");
}

type ReplicateTrainingOutput = {
  version?: string;
  weights?: string;
};

type ReplicateTraining = {
  id: string;
  created_at: string;
  updated_at: string;
  version: { id: string };
  destination: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  input: any;
  error: string | null;
  output?: ReplicateTrainingOutput;
};

export async function POST(request: Request) {
  console.log("🎯 Webhook de entrenamiento recibido");
  const training = (await request.json()) as ReplicateTraining;
  console.log("📦 Datos de entrenamiento:", JSON.stringify(training, null, 2));

  const urlObj = new URL(request.url);
  const user_id = urlObj.searchParams.get("user_id");
  const model_id = urlObj.searchParams.get("model_id");
  const webhook_secret = urlObj.searchParams.get("webhook_secret");

  console.log("🔍 Parámetros URL:", { user_id, model_id, webhook_secret: "***" });

  if (!model_id || !user_id || !webhook_secret) {
    console.error("❌ Parámetros URL faltantes");
    return NextResponse.json(
      { message: "URL mal formada. Faltan parámetros." },
      { status: 500 }
    );
  }

  if (webhook_secret.toLowerCase() !== (appWebhookSecret as string).toLowerCase()) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  console.log("🔌 Iniciando conexión a Supabase");
  const supabase = createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  console.log("👤 Verificando usuario:", user_id);
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(user_id);

  if (error || !user) {
    console.error("❌ Error verificando usuario:", error);
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }
  console.log("✅ Usuario verificado:", user.email);

  if (training.status === "succeeded") {
    console.log("🎉 Entrenamiento exitoso, actualizando modelo");

    // Ahora tomamos la version desde training.output.version
    if (!training.output || !training.output.version) {
      console.error('❌ No se encontró "version" en el objeto output del entrenamiento');
      return NextResponse.json(
        { message: "No se encontró la version." },
        { status: 500 }
      );
    }

    const modelVersion = training.output.version;

    console.log("📝 Actualizando modelo en DB con version:", { model_id, modelVersion });
    const { error: modelUpdateError } = await supabase
      .from("models")
      .update({
        modelId: modelVersion,
        status: "finished",
      })
      .eq("id", model_id);

    if (modelUpdateError) {
      console.error("❌ Error actualizando modelo:", modelUpdateError);
      return NextResponse.json(
        { message: "Error actualizando el modelo." },
        { status: 500 }
      );
    }
    console.log("✅ Modelo actualizado correctamente");

    if (resendApiKey) {
      console.log("📧 Iniciando envío de email");
      console.log("📧 API Key presente:", resendApiKey.substring(0, 5) + "...");
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);
        
        const emailData = {
          from: "info@retratai.com",
          to: user.email ?? "",
          subject: "Tu modelo está listo",
          html: `<p>Tu modelo ha sido entrenado exitosamente y está listo para usarse.</p>`,
        };
        
        console.log("📧 Intentando enviar email con datos:", {
          ...emailData,
          to: user.email ? user.email.substring(0, 3) + "..." : "no email"
        });
        
        const response = await resend.emails.send(emailData);
        
        if (response.error) {
          throw new Error(`Error de Resend: ${response.error.message}`);
        }
        
        console.log("📧 Respuesta de Resend:", response);
        console.log("✅ Email enviado correctamente");
      } catch (e: any) {
        console.error("❌ Error detallado enviando email:", {
          error: e,
          message: e.message,
          name: e.name,
          stack: e.stack
        });
      }
    } else {
      console.log("⚠️ No se encontró RESEND_API_KEY en las variables de entorno");
    }
  } else if (training.status === "failed" || training.status === "canceled") {
    console.log("⚠️ Entrenamiento fallido o cancelado:", training.status);
    const { error: modelUpdateError } = await supabase
      .from("models")
      .update({
        status: training.status,
      })
      .eq("id", model_id);

    if (modelUpdateError) {
      console.error("❌ Error actualizando estado del modelo:", modelUpdateError);
      return NextResponse.json(
        { message: "Error actualizando estado del modelo tras fallo." },
        { status: 500 }
      );
    }
    console.log("✅ Estado del modelo actualizado a:", training.status);
  }

  console.log("🏁 Webhook procesado correctamente");
  return NextResponse.json({ message: "OK" }, { status: 200 });
}
