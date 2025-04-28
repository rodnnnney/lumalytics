'use client';

import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  //CardDescription
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Settings() {
  const [showLogout, setShowLogout] = useState(false);

  const {
    user,
    //loading :authLoading
  } = useAuth();

  const handleLogout = () => {
    setShowLogout(true);
  };

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

  const { data, error, isLoading, refetch } = useQuery({
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
            <CardTitle className="text-xl">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{data!.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 ">Last Sign In</p>
                <p className="mt-1">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex mb-4">
            <Button className="bg-luma-red text-white" onClick={handleLogout}>
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        {showLogout && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-96 p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Confirm Sign Out</h3>
                <p className="text-sm text-gray-500 mt-1">Are you sure you want to sign out?</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 transition-colors duration-500 hover:bg-gray-50"
                  onClick={() => setShowLogout(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-luma-red rounded-md text-sm font-medium text-white hover:bg-red-700 transition-colors duration-500"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
