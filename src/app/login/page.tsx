import Image from 'next/image';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

const redirectTo =
  process.env.NODE_ENV === 'production'
    ? 'https://lumalytics.app/auth/callback'
    : 'http://localhost:3000/auth/callback';

async function signInWithGithub() {
  'use server';

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin');

  if (!origin) {
    console.error('Origin header not found');
    return;
  }

  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectTo,
    },
  });

  if (error) {
    console.error('GitHub sign in error:', error);
    return;
  }

  return redirect(data.url);
}

async function signInWithGoogle() {
  'use server';

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin');

  if (!origin) {
    console.error('Origin header not found');
    return;
  }

  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo,
    },
  });

  if (error) {
    console.error('Google sign in error:', error);
    return;
  }

  return redirect(data.url);
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Sign in to Lumalytics</h1>
            <p className="mt-2 text-gray-600">Choose your preferred sign-in method</p>
          </div>

          <div className="mt-8 space-y-4">
            <form action={signInWithGithub} className="w-full">
              <button className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                <Image src="/github-mark-white.png" width={24} height={24} alt="GitHub logo" />
                Sign in with GitHub
              </button>
            </form>

            <form action={signInWithGoogle} className="w-full">
              <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                <Image src="/google.webp" width={24} height={24} alt="Google logo" />
                Sign in with Google
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
