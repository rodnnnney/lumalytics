'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) {
          console.error('AuthContext: Error fetching user:', authError);
          setError(authError);
        }
        console.log('[AuthContext] Setting user:', currentUser?.id);
        setUser(currentUser);
      } catch (catchError) {
        console.error('AuthContext: Exception fetching user:', catchError);
        setError(catchError as Error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Optional: Set up a listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state changed, setting user:', session?.user?.id);
      setUser(session?.user ?? null);
      // No need to set loading here as it's for ongoing changes
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user && !loading && pathname !== '/') {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const value = { user, loading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
