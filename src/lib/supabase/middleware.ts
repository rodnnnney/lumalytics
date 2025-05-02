import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') && // Ensure '/login' itself is accessible
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/')

    // Allow access to auth routes like /auth/oauth, /auth/login
  ) {
    // No user, redirect to login.
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login'; // Ensure this matches your actual login page route
    console.log('Redirecting to login, user not found on path:', request.nextUrl.pathname); // Add logging
    return NextResponse.redirect(url);
  }

  // IMPORTANT: Return the *one* response object that Supabase mutated.
  return response;
}

// Ensure you have a middleware.ts file that uses this function:
/*
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware' // Adjust path if needed

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets, api routes etc. if needed
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') || // Adjust if your auth callback is an API route
    request.nextUrl.pathname.includes('.') // Skip files
  ) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    // Match all routes except specific ones if necessary
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

*/
