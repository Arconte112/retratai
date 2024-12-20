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

// La documentación de Replicate indica que el webhook recibirá un objeto de entrenamiento.
// Ejemplo: https://replicate.com/docs/reference/http#trainings
type ReplicateTraining = {
  id: string;
  created_at: string;
  updated_at: string;
  version: {
    id: string;
  };
  destination: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  input: any;
  error: string | null;
};

export async function POST(request: Request) {
  const training = (await request.json()) as ReplicateTraining;

  const urlObj = new URL(request.url);
  const user_id = urlObj.searchParams.get("user_id");
  const model_id = urlObj.searchParams.get("model_id");
  const webhook_secret = urlObj.searchParams.get("webhook_secret");

  if (!model_id || !user_id || !webhook_secret) {
    return NextResponse.json(
      { message: "URL mal formada. Faltan parámetros." },
      { status: 500 }
    );
  }

  if (webhook_secret.toLowerCase() !== (appWebhookSecret as string).toLowerCase()) {
    return NextResponse.json(
      { message: "No autorizado." },
      { status: 401 }
    );
  }

  const supabase = createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // Verificar el usuario
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(user_id);

  if (error || !user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  // Si el entrenamiento ha finalizado con éxito, actualizamos el modelo
  if (training.status === "succeeded") {
    const { error: modelUpdateError } = await supabase
      .from("models")
      .update({
        status: "finished",
        modelId: training.destination, // Guardamos el destino final como el ID del modelo entrenado
      })
      .eq("id", model_id);

    if (modelUpdateError) {
      console.error({ modelUpdateError });
      return NextResponse.json(
        { message: "Error actualizando el modelo." },
        { status: 500 }
      );
    }

    // Opcional: enviar email notificando al usuario que su modelo está listo usando Resend
    if (resendApiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "noreply@ejemplo.com",
          to: user.email ?? "",
          subject: "Tu modelo está listo",
          html: `<p>Tu modelo ha sido entrenado exitosamente y está listo para usarse.</p>`,
        });
      } catch (e) {
        console.error("Error enviando email: ", e);
      }
    }
  } else if (training.status === "failed" || training.status === "canceled") {
    // Si falló o se canceló, podemos actualizar el estado del modelo
    const { error: modelUpdateError } = await supabase
      .from("models")
      .update({
        status: training.status,
      })
      .eq("id", model_id);

    if (modelUpdateError) {
      console.error({ modelUpdateError });
      return NextResponse.json(
        { message: "Error actualizando estado del modelo tras fallo." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
