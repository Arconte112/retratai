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
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const supabase = createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(user_id);

  if (error || !user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  if (training.status === "succeeded") {
    if (!training.output || !training.output.version) {
      return NextResponse.json(
        { message: "No se encontró la version." },
        { status: 500 }
      );
    }

    const modelVersion = training.output.version;

    const { error: modelUpdateError } = await supabase
      .from("models")
      .update({
        modelId: modelVersion,
        status: "finished",
      })
      .eq("id", model_id);

    if (modelUpdateError) {
      return NextResponse.json(
        { message: "Error actualizando el modelo." },
        { status: 500 }
      );
    }

    if (resendApiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);
        
        const emailData = {
          from: "info@retratai.com",
          to: user.email ?? "",
          subject: "Tu modelo está listo",
          html: `<p>Tu modelo ha sido entrenado exitosamente y está listo para usarse.</p>`,
        };
        
        const response = await resend.emails.send(emailData);
        
        if (response.error) {
          throw new Error(`Error de Resend: ${response.error.message}`);
        }
      } catch (e: any) {
        // Error handling silently continues
      }
    }
  } else if (training.status === "failed" || training.status === "canceled") {
    const { error: modelUpdateError } = await supabase
      .from("models")
      .update({
        status: training.status,
      })
      .eq("id", model_id);

    if (modelUpdateError) {
      return NextResponse.json(
        { message: "Error actualizando estado del modelo tras fallo." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
