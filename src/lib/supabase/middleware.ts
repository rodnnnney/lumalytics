import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/sign-up',
  '/auth/callback',
  '/auth/reset-password',
  '/',
];

const AUTH_PATHS = ['/auth'];

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/profile', '/projects', '/settings', '/api'];

/**
 * Checks if a URL pathname should be protected (requires authentication)
 */
function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some(path => pathname === path)) {
    return false;
  }

  if (AUTH_PATHS.some(path => pathname.startsWith(path))) {
    return false;
  }

  if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    return true;
  }
  return true;
}

export async function updateSession(request: NextRequest) {
  // Create *one* response object that will be mutated as needed.
  const response = NextResponse.next({
    request: {
      headers: request.headers, // Pass headers to the new request object
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
          // Set cookies on the *single response* object.
          request.cookies.set({ name, value, ...options }); // Update request cookies for potential server-side use *within the same request lifecycle*
          response.cookies.set({ name, value, ...options }); // Set cookies on the *outgoing response*
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookies from both request and response objects.
          request.cookies.set({ name, value: '', ...options }); // Clear in request context
          response.cookies.set({ name, value: '', ...options }); // Set empty cookie on outgoing response
        },
      },
    }
  );

  // IMPORTANT: Avoid placing code between createServerClient and getUser.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if the path requires authentication and user is not logged in
  if (!user && isProtectedPath(pathname)) {
    // No user and protected path, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    console.log('Redirecting to login, user not found on protected path:', pathname);
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access auth pages (like login/signup), redirect to dashboard
  if (user && AUTH_PATHS.some(path => pathname.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard'; // Redirect to dashboard or home page
    return NextResponse.redirect(url);
  }

  // IMPORTANT: Return the *one* response object that Supabase mutated.
  return response;
}
