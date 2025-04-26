'use client';

import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const { user, loading: authLoading } = useAuth();

  const fetchUser = async () => {
    if (!user) {
      return null;
    }

    try {
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: fetchUser,
    staleTime: Infinity,
    gcTime: 1 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Error fetching user profile</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No user data found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-transparent">
        Settings
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{data!.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Last Sign In</p>
                <p className="mt-1">{new Date().toLocaleString()}</p>
              </div>
              <div>
                <Button onClick={logout}>Sign Out</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end mb-4">
            <Button variant="destructive" onClick={logout}>
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs">Data Management</CardTitle>
            <CardDescription>Manage your data and exports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                Export All Data
              </Button>
              <Button variant="outline" className="w-full">
                Download Event History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
