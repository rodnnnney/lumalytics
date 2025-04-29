import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  // Log all relevant information for debugging
  console.log('================================');
  console.log('AUTH CALLBACK DEBUGGING');
  console.log('================================');
  console.log('Request URL:', request.url);
  console.log('Origin:', origin);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Is development:', process.env.NODE_ENV === 'development');
  
  // Log all headers for debugging
  console.log('Headers:');
  request.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`);
  });

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';

      console.log('isLocalEnv:', isLocalEnv);
      console.log('forwardedHost:', forwardedHost);
      console.log('Will redirect to:', isLocalEnv 
        ? `${origin}${next}` 
        : forwardedHost 
          ? `https://lumalytics.app${next}` 
          : `${origin}${next}`);
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        console.log('Using local origin for redirect:', `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        // In production, always use the production URL regardless of headers
        const redirectOrigin = 'https://lumalytics.app';
        console.log('Using production origin for redirect:', `${redirectOrigin}${next}`);
        return NextResponse.redirect(`${redirectOrigin}${next}`);
      }
    } else {
      console.log('Error exchanging code for session:', error);
    }
  } else {
    console.log('No code parameter found in URL');
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
