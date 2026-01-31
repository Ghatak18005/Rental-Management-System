import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // 1. Refresh Session
    const { data: { user } } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // 2. Global Public Routes (Always accessible)
    const publicRoutes = [
      '/login', 
      '/signup', 
      '/auth/callback', 
      '/forgot-password',
      '/reset-password',
      '/api/auth/verify-signup', 
      '/api/auth/send-otp',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/logout'
    ]
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/'

    // 3. Handle Unauthenticated Users
    if (!user) {
        // Allow access to public routes
        if (isPublicRoute) {
            return response
        }
        // Redirect to login for ALL other routes (everything else is protected)
        url.pathname = '/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }

    // 4. Handle Authenticated Users
    if (user) {
        // 4a. Redirect away from auth pages if logged in
        if (pathname === '/login' || pathname.startsWith('/signup')) {
            url.pathname = '/dashboard' // Default redirect, logic below will fix if role differs
            // use NextResponse.redirect(url) but let the profile check happen first to be sure?
            // Actually, we need the profile to know WHERE to send them, or just send to default and let middleware re-route?
            // Let's check profile first.
        }

        // 4b. Fetch User Profile to check Role and Onboarding Status
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        // 4c. Enforce Onboarding
        // If no profile exists, they MUST go to /onboarding
        if (!profile) {
            if (pathname !== '/onboarding' && !pathname.startsWith('/api/') && !pathname.startsWith('/auth/callback')) {
                url.pathname = '/onboarding'
                return NextResponse.redirect(url)
            }
            // Allow access to /onboarding
            return response
        }

        // 4d. If Profile Exists, Block /onboarding
        if (pathname.startsWith('/onboarding') && profile) {
            // Redirect to their specific dashboard
            if (profile.role === 'VENDOR') url.pathname = '/vendor/dashboard'
            else if (profile.role === 'ADMIN') url.pathname = '/admin/dashboard'
            else url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        // 4e. Redirect Logged-In Users from Login/Signup pages
        if ((pathname === '/login' || pathname.startsWith('/signup')) && profile) {
            if (profile.role === 'VENDOR') url.pathname = '/vendor/dashboard'
            else if (profile.role === 'ADMIN') url.pathname = '/admin/dashboard'
            else url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        // 4f. Role-Based Access Control
        // VENDOR Routes
        if (pathname.startsWith('/vendor') && profile.role !== 'VENDOR') {
            url.pathname = '/dashboard' // Fallback to customer dashboard or error
            return NextResponse.redirect(url)
        }

        // ADMIN Routes
        if (pathname.startsWith('/admin') && profile.role !== 'ADMIN') {
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        // CUSTOMER Routes (assuming /dashboard is core customer area)
        // You might want to prevent VENDOR/ADMIN from accessing customer dashboard if they are distinct
        // But usually admins might access everything. The prompt says: "/dashboard/* is for CUSTOMER"
        // So if strictly enforcing:
        if (pathname.startsWith('/dashboard') && profile.role !== 'CUSTOMER') {
            // Maybe redirect to their own dashboard?
            if (profile.role === 'VENDOR') url.pathname = '/vendor/dashboard'
            else if (profile.role === 'ADMIN') url.pathname = '/admin/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
