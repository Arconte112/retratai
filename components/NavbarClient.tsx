'use client';

import { AvatarIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Button } from "./ui/button";
import React, { useEffect, useState } from "react";
import ClientSideCredits from "./realtime/ClientSideCredits";
import { motion } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

interface NavbarClientProps {
  userEmail: string | null;
  userId: string | null;
  credits: {
    credits: number;
    user_id: string;
    id: number;
    created_at: string;
  } | null;
}

export default function NavbarClient({ userEmail, userId, credits }: NavbarClientProps) {
  const isLoggedIn = !!userId;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    }

    if (isLoggedIn) {
      getProfile();
    }
  }, [isLoggedIn, supabase.auth]);

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <motion.h2 
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                RetratAI
              </motion.h2>
            </Link>
          </div>

          {isLoggedIn && (
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/overview">
                <Button variant="ghost" className="text-sm font-medium">
                  Inicio
                </Button>
              </Link>
              {packsIsEnabled && (
                <Link href="/overview/packs">
                  <Button variant="ghost" className="text-sm font-medium">
                    Paquetes
                  </Button>
                </Link>
              )}
              {stripeIsConfigured && (
                <Link href="/get-credits">
                  <Button variant="ghost" className="text-sm font-medium">
                    Obtener Créditos
                  </Button>
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4">
            {!isLoggedIn && (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
            {isLoggedIn && (
              <div className="flex items-center space-x-4">
                {stripeIsConfigured && (
                  <div className="bg-gray-100 px-3 py-1.5 rounded-full">
                    <ClientSideCredits creditsRow={credits} />
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-9 w-9 p-0 rounded-full"
                    >
                      <Avatar>
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback>
                          <AvatarIcon className="h-5 w-5 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userEmail}</p>
                        <p className="text-xs text-gray-500">Mi Cuenta</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <form action="/auth/sign-out" method="post">
                      <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Cerrar Sesión
                      </Button>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 