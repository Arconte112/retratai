import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import { Database } from './types/supabase'

export async function middleware(req: NextRequest) {
  console.log('🔍 Middleware iniciado - URL:', req.url)
  console.log('📍 Pathname:', req.nextUrl.pathname)
  console.log('🌐 Host:', req.headers.get('host'))
  console.log('🍪 Cookies presentes:', req.cookies.size > 0 ? 'Sí' : 'No')
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  try {
    console.log('⏳ Obteniendo sesión...')
    const sessionResponse = await supabase.auth.getSession()
    console.log('📦 Respuesta completa de sesión:', JSON.stringify(sessionResponse))
    
    const { data: { session } } = sessionResponse
    console.log('🔑 Estado de sesión:', session ? 'Activa' : 'No hay sesión')
    
    if (session) {
      console.log('👤 Usuario:', session.user.email)
      console.log('⏰ Sesión expira:', new Date(session.expires_at! * 1000).toISOString())
      console.log('🎫 Token presente:', !!session.access_token)
    }

    // Verificar cookies de autenticación
    const authCookie = req.cookies.get('sb-access-token')
    console.log('🔐 Cookie de autenticación:', authCookie ? 'Presente' : 'Ausente')
    
    // Si no hay sesión y la ruta es /overview, redirigir a la página principal
    if (!session && req.nextUrl.pathname.startsWith('/overview')) {
      console.log('🚫 Usuario no autenticado intentando acceder a /overview - Redirigiendo a /')
      const redirectUrl = new URL('/', req.url)
      console.log('↪️ Redirigiendo a:', redirectUrl.toString())
      return NextResponse.redirect(redirectUrl)
    }
    
    // Si hay sesión y la ruta es /, redirigir a /overview
    if (session && req.nextUrl.pathname === '/') {
      console.log('✅ Usuario autenticado en / - Redirigiendo a /overview')
      const redirectUrl = new URL('/overview', req.url)
      console.log('↪️ Redirigiendo a:', redirectUrl.toString())
      return NextResponse.redirect(redirectUrl)
    }

    console.log('✨ Middleware completado - Sin redirección necesaria')
  } catch (error) {
    console.error('❌ Error en middleware:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace disponible')
    // En caso de error, permitimos el acceso pero loggeamos
    return res
  }

  // Asegurarnos de que las cookies de sesión se propaguen
  return res
}

export const config = {
  matcher: ['/', '/overview/:path*']
}