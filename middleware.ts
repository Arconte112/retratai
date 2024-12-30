import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import { Database } from './types/supabase'

export async function middleware(req: NextRequest) {
  console.log('🔍 Middleware iniciado - URL:', req.url)
  console.log('📍 Pathname:', req.nextUrl.pathname)
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  try {
    console.log('⏳ Obteniendo sesión...')
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔑 Estado de sesión:', session ? 'Activa' : 'No hay sesión')
    
    if (session) {
      console.log('👤 Usuario:', session.user.email)
      console.log('⏰ Sesión expira:', new Date(session.expires_at! * 1000).toISOString())
    }
    
    // Si no hay sesión y la ruta es /overview, redirigir a la página principal
    if (!session && req.nextUrl.pathname.startsWith('/overview')) {
      console.log('🚫 Usuario no autenticado intentando acceder a /overview - Redirigiendo a /')
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    // Si hay sesión y la ruta es /, redirigir a /overview
    if (session && req.nextUrl.pathname === '/') {
      console.log('✅ Usuario autenticado en / - Redirigiendo a /overview')
      return NextResponse.redirect(new URL('/overview', req.url))
    }

    console.log('✨ Middleware completado - Sin redirección necesaria')
  } catch (error) {
    console.error('❌ Error en middleware:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace disponible')
  }

  return res
}

export const config = {
  matcher: ['/', '/overview/:path*']
}