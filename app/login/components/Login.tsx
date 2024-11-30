"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineGoogle } from "react-icons/ai";

type Inputs = {
  email: string;
  password: string;
};

export const Login = ({
  host,
  searchParams,
}: {
  host: string | null;
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const supabase = createClientComponentClient<Database>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const protocol = host?.includes("localhost") ? "http" : "https";
  const redirectUrl = `${protocol}://${host}/auth/callback`;

  const signInWithGoogle = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Algo salió mal",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) throw error;

        toast({
          title: "Email de verificación enviado",
          description: "Por favor, revisa tu correo para verificar tu cuenta.",
          duration: 5000,
        });
      } else {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        if (user && !user.email_confirmed_at) {
          // Reenviar correo de verificación
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: data.email,
            options: {
              emailRedirectTo: redirectUrl,
            },
          });

          if (resendError) throw resendError;

          toast({
            title: "Correo no verificado",
            description: "Te hemos enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada.",
            duration: 5000,
          });
          return;
        }

        // Redirect to overview page after successful login
        window.location.href = '/overview';
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Algo salió mal",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 p-4 rounded-xl max-w-sm w-full">
        <h1 className="text-xl">{isSignUp ? "Crear Cuenta" : "Bienvenido de Nuevo"}</h1>
        <p className="text-xs opacity-60">
          {isSignUp ? "Regístrate para comenzar" : "Inicia sesión para continuar"}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Input
              placeholder="Correo electrónico"
              {...register("email", { required: true })}
              type="email"
            />
            {errors.email && (
              <span className="text-red-500 text-xs">El correo electrónico es requerido</span>
            )}
          </div>

          <div>
            <Input
              placeholder="Contraseña"
              {...register("password", { required: true, minLength: 6 })}
              type="password"
            />
            {errors.password && (
              <span className="text-red-500 text-xs">
                La contraseña debe tener al menos 6 caracteres
              </span>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Cargando..." : isSignUp ? "Registrarse" : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-50 dark:bg-neutral-900 px-2 text-neutral-600">
              O continuar con
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={signInWithGoogle}
          disabled={isSubmitting}
        >
          <AiOutlineGoogle className="mr-2" />
          Google
        </Button>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-blue-600 hover:underline"
        >
          {isSignUp ? "¿Ya tienes una cuenta? Inicia Sesión" : "¿Necesitas una cuenta? Regístrate"}
        </button>
      </div>
    </div>
  );
};
