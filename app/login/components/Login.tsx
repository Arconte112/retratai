"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineGoogle } from "react-icons/ai";
import { motion } from "framer-motion";

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

  const getRedirectUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;
    }
    return `${protocol}://${host}/auth/callback`;
  };

  const redirectUrl = getRedirectUrl();

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {isSignUp ? "Crear Cuenta" : "Bienvenido"}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? "Regístrate para comenzar" : "Inicia sesión para continuar"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={signInWithGoogle}
              disabled={isSubmitting}
              className="w-full py-6 mb-6 bg-white hover:bg-gray-50 border-2 transition-all"
            >
              <AiOutlineGoogle className="mr-2 h-5 w-5" />
              Continuar con Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continuar con email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  placeholder="Correo electrónico"
                  {...register("email", { required: true })}
                  type="email"
                  className="py-6 bg-gray-50 border-0"
                />
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1 block">
                    El correo electrónico es requerido
                  </span>
                )}
              </div>

              <div>
                <Input
                  placeholder="Contraseña"
                  {...register("password", { required: true, minLength: 6 })}
                  type="password"
                  className="py-6 bg-gray-50 border-0"
                />
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1 block">
                    La contraseña debe tener al menos 6 caracteres
                  </span>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </div>
                ) : (
                  isSignUp ? "Crear cuenta" : "Iniciar sesión"
                )}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isSignUp ? "¿Ya tienes una cuenta? Inicia Sesión" : "¿Necesitas una cuenta? Regístrate"}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
