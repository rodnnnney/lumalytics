import Image from 'next/image';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export default function LoginForm() {
  const signIn = async () => {
    'use server';

    // 1. Create a Supabase client
    const supabase = createClient();
    const origin = (await headers()).get('origin');

    console.log('Origin:', origin);
    // 2. Sign in with GitHub
    const { error, data } = await (
      await supabase
    ).auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `lumalytics.app/auth/callback`,
      },
    });

    if (error) {
      console.log(error);
    } else {
      return redirect(data.url);
    }
    // 3. Redirect to landing page
  };

  return (
    <form action={signIn} className="flex-1 flex min-h-screen justify-center items-center">
      <button className="hover:bg-gray-800 p-8 rounded-xl">
        <Image
          className="mx-auto mb-3"
          src="/github-mark-white.png"
          width={100}
          height={100}
          alt="GitHub logo"
        />
        Sign in with GitHub
      </button>
    </form>
  );
}

// import { useEffect } from 'react';
// import { redirect, useRouter } from 'next/navigation';
// import { headers } from 'next/headers';
// import { supabase } from '@/utils/supabase/client';
// import { createClient } from '@/utils/supabase/client';

// export default function Home() {
//   const router = useRouter();

//   // useEffect(() => {
//   //   const {
//   //     data: { subscription },
//   //   } = supabase.auth.onAuthStateChange((event, session) => {
//   //     if (session) {
//   //       router.push('/dashboard');
//   //     }
//   //   });

//   //   return () => {
//   //     subscription.unsubscribe();
//   //   };
//   // }, [router]);

//   const signIn = async () => {
//     'use server';

//     // 1. Create a Supabase client
//     const supa = await createClient();
//     const origin = (await headers()).get('origin');
//     // 2. Sign in with GitHub
//     const { error, data } = await supa.auth.signInWithOAuth({
//       provider: 'github',
//       options: {
//         redirectTo: `${origin}/auth/callback`,
//       },
//     });

//     if (error) {
//       console.log(error);
//     } else {
//       return redirect(data.url);
//     }
//     // 3. Redirect to landing page
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
//         <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
//         <form onSubmit={e => e.preventDefault()} className="space-y-4">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               required
//               className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               required
//               className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//           <div>
//             <button
//               type="submit"
//               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               Sign In
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
