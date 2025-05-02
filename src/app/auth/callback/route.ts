import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(`${requestUrl.origin}/`);
    }

    const redirectTo =
      process.env.NODE_ENV === 'production'
        ? 'https://lumalytics.app/dashboard'
        : 'http://localhost:3000/dashboard';

    // Exchange the auth code for a session
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log(error);

    // Successfully authenticated, redirect to dashboard
    return NextResponse.redirect(redirectTo);
  } catch (error) {
    console.error('Authentication callback error:', error);
    // In case of an error, redirect to the homepage
    return NextResponse.redirect(`${request}/`);
  }
}
