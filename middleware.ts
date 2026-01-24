import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // Get session
    const { data: { session } } = await supabase.auth.getSession();

    // Protect all authenticated routes
    if (
        !session &&
        (request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/warden') ||
            request.nextUrl.pathname.startsWith('/profile') ||
            request.nextUrl.pathname.startsWith('/pass'))
    ) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // CRITICAL: Protect warden routes with role check
    if (request.nextUrl.pathname.startsWith('/warden')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Fetch user role from database
        const { data: user, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (error || !user || user.role !== 'warden') {
            console.warn('Unauthorized warden access attempt:', session.user.email);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Protect student routes (dashboard, profile) - must be authenticated
    if (
        session &&
        (request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/profile'))
    ) {
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

        // If warden tries to access student routes, redirect to warden panel
        if (user?.role === 'warden' && request.nextUrl.pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/warden', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/warden/:path*',
        '/profile/:path*',
        '/pass/:path*',
    ],
};
