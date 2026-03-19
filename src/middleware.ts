import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Allow auth routes and API routes with their own auth through
  if (pathname.startsWith('/auth') || pathname.startsWith('/api/admin/briefing')) {
    return supabaseResponse
  }

  // No user — redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Check onboarding status and session enforcement
  if (!pathname.startsWith('/onboarding') && !pathname.startsWith('/welcome')) {
    const { data: profile } = await supabase
      .from('learner_profiles')
      .select('onboarding_complete, active_session_ids')
      .eq('id', user.id)
      .single()

    // No profile or onboarding incomplete — redirect to onboarding
    if (!profile || !profile.onboarding_complete) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // Session enforcement: allow up to 2 concurrent sessions
    const activeIds: string[] = profile.active_session_ids ?? []
    const cookieSessionId = request.cookies.get('academy_session_id')?.value
    if (cookieSessionId && activeIds.length > 0 && !activeIds.includes(cookieSessionId)) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('error', 'session_replaced')
      const response = NextResponse.redirect(url)
      response.cookies.delete('academy_session_id')
      return response
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico (browser favicon)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
