// // utils/supabase/middleware.ts
// import { createServerClient, type CookieOptions } from '@supabase/ssr';
// import { type NextRequest, NextResponse } from 'next/server';

// export async function updateSession(request: NextRequest) {
//   let response = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return request.cookies.get(name)?.value;
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           request.cookies.set({
//             name,
//             value,
//             ...options,
//           });
//           response = NextResponse.next({
//             request: {
//               headers: request.headers,
//             },
//           });
//           // Update the response setting the cookie for the client browser
//           response.cookies.set({
//             name,
//             value,
//             ...options,
//           });
//         },
//         remove(name: string, options: CookieOptions) {
//           // If the cookie is removed, update the request for Server Components
//           request.cookies.set({
//             name,
//             value: '',
//             ...options,
//           });
//           response = NextResponse.next({
//             request: {
//               headers: request.headers,
//             },
//           });
//           // Update the response removing the cookie for the client browser
//           response.cookies.set({
//             name,
//             value: '',
//             ...options,
//           });
//         },
//       },
//     }
//   );

//   // Refresh session if expired - important!
//   await supabase.auth.getUser();

//   return response;
// }
