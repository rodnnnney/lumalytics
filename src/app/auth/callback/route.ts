import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      // If no code is provided, redirect to home page
      return NextResponse.redirect(`${requestUrl.origin}/`);
    }

    // Exchange the auth code for a session
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log(error);

    // Successfully authenticated, redirect to dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  } catch (error) {
    console.error('Authentication callback error:', error);
    // In case of an error, redirect to the homepage
    return NextResponse.redirect(`${new URL(request.url).origin}`);
  }
}
