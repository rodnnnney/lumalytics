'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { cn } from '@/utils/util';
import Image from 'next/image';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoadingGithub(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?next=/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoadingGithub(false);
    }
  };

  const handleSocialGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoadingGoogle(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?next=/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardContent>
          <form onSubmit={handleSocialLogin}>
            <div className="flex flex-col gap-6">
              {error && <p className="text-sm text-destructive-500">{error}</p>}
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-black text-white"
                disabled={isLoadingGithub}
              >
                <Image src="/github-mark-white.png" width={24} height={24} alt="GitHub logo" />
                {isLoadingGithub ? 'Logging in...' : 'Continue with Github'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <form onSubmit={handleSocialGoogle}>
            <div className="flex flex-col gap-6">
              {error && <p className="text-sm text-destructive-500">{error}</p>}
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-white text-black"
                disabled={isLoadingGoogle}
              >
                <Image src="/google.webp" width={24} height={24} alt="GitHub logo" />
                {isLoadingGoogle ? 'Logging in...' : 'Continue with Google'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
