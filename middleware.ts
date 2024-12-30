import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from './types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Rutas que requieren autenticación
  const protectedRoutes = ['/overview', '/models', '/astria']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  
  // Rutas públicas que no deberían ser accesibles si está autenticado
  const publicOnlyRoutes = ['/login']
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    // Redirigir a login si intenta acceder a ruta protegida sin sesión
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (isPublicOnlyRoute && session) {
    // Redirigir a overview si intenta acceder a login con sesión activa
    const redirectUrl = new URL('/overview', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/overview/:path*',
    '/models/:path*',
    '/astria/:path*',
    '/login',
  ],
}