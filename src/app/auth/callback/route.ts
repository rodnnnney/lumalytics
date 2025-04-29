import { createClient } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + '/dashboard');
}

// import { NextResponse } from 'next/server';
// import { createClient } from '@/utils/supabase/server';

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get('code');
//   // if "next" is in param, use it as the redirect URL
//   const next = searchParams.get('next') ?? '/dashboard';

//   // Log all relevant information for debugging
//   console.log('================================');
//   console.log('AUTH CALLBACK DEBUGGING');
//   console.log('================================');
//   console.log('Request URL:', request.url);
//   console.log('Origin:', origin);
//   console.log('NODE_ENV:', process.env.NODE_ENV);
//   console.log('Is development:', process.env.NODE_ENV === 'development');

//   // Log all headers for debugging
//   console.log('Headers:');
//   request.headers.forEach((value, key) => {
//     console.log(`  ${key}: ${value}`);
//   });

//   if (code) {
//     const supabase = await createClient();
//     const { error } = await supabase.auth.exchangeCodeForSession(code);
//     if (!error) {
//       const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer

//       // Use multiple checks to determine environment:
//       // 1. Check NODE_ENV
//       // 2. Check if hostname is localhost
//       // 3. Check for presence of production headers like x-forwarded-host
//       const url = new URL(request.url);
//       const isLocalEnv =
//         process.env.NODE_ENV === 'development' &&
//         (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
//         !forwardedHost;

//       console.log('NODE_ENV:', process.env.NODE_ENV);
//       console.log('Hostname:', url.hostname);
//       console.log('isLocalEnv:', isLocalEnv);
//       // Check for known production domain patterns in the request URL
//       const isProductionUrl =
//         request.url.includes('lumalytics.app') ||
//         request.url.includes('lumalytics.netlify.app') ||
//         (forwardedHost &&
//           (forwardedHost.includes('lumalytics.app') ||
//             forwardedHost.includes('lumalytics.netlify.app')));

//       console.log('isProductionUrl:', isProductionUrl);
//       console.log('forwardedHost:', forwardedHost);
//       console.log(
//         'Will redirect to:',
//         isLocalEnv
//           ? `${origin}${next}`
//           : isProductionUrl
//             ? `https://lumalytics.app${next}`
//             : `${origin}${next}`
//       );

//       // Determine if we're in a local testing environment or production
//       // Check explicitly for localhost in the URL to ensure local redirects work properly
//       const isLocalHostUrl = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

//       // If we're accessing via localhost, redirect to localhost regardless of other factors
//       if (isLocalHostUrl) {
//         console.log('Using local origin for redirect:', `${origin}${next}`);
//         return NextResponse.redirect(`${origin}${next}`);
//       }
//       // If it's a known production URL or contains production hostname, use production URL
//       else if (isProductionUrl) {
//         const redirectOrigin = 'https://lumalytics.app';
//         console.log('Using production origin for redirect:', `${redirectOrigin}${next}`);
//         return NextResponse.redirect(`${redirectOrigin}${next}`);
//       }
//       // For all other cases, use the original origin
//       else {
//         console.log('Using original origin for redirect:', `${origin}${next}`);
//         return NextResponse.redirect(`${origin}${next}`);
//       }
//     } else {
//       console.log('Error exchanging code for session:', error);
//     }
//   } else {
//     console.log('No code parameter found in URL');
//   }

//   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
// }
