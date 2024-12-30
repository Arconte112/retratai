import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import { Database } from './types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  try {
    const sessionResponse = await supabase.auth.getSession()
    const { data: { session } } = sessionResponse

    // Si no hay sesión y la ruta es /overview, redirigir a la página principal
    if (!session && req.nextUrl.pathname.startsWith('/overview')) {
      const redirectUrl = new URL('/', req.url)
      const response = NextResponse.redirect(redirectUrl)
      
      // Configurar el dominio de las cookies en la respuesta si estamos en el dominio personalizado
      if (req.headers.get('host')?.includes('retratai.com')) {
        response.cookies.set('sb-access-token', '', {
          domain: '.retratai.com',
          path: '/',
          secure: true,
          sameSite: 'lax'
        })
      }
      
      return response
    }
    
    // Si hay sesión y la ruta es /, redirigir a /overview
    if (session && req.nextUrl.pathname === '/') {
      const redirectUrl = new URL('/overview', req.url)
      return NextResponse.redirect(redirectUrl)
    }

  } catch (error) {
    return res
  }

  return res
}

export const config = {
  matcher: ['/', '/overview/:path*']
}