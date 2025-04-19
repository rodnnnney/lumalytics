'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        // Fetch user profile data if available
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData) {
          setName(profileData.name || '');
          setOrganization(profileData.organization || '');
          setNotifications(profileData.notifications !== false);
          setDarkMode(profileData.dark_mode === true);
        }
      }
      setLoading(false);
    };

    getUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      setMessage(`Error signing in: ${error.message}`);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            organization,
          },
        },
      });

      if (error) throw error;
      setMessage('Check your email for the confirmation link!');
    } catch (error: any) {
      setMessage(`Error signing up: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    setMessage('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      setMessage(`Error signing out: ${error.message}`);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!user) return;

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name,
        organization,
        notifications,
        dark_mode: darkMode,
        updated_at: new Date(),
      });

      if (error) throw error;
      setMessage('Profile updated successfully!');
    } catch (error: any) {
      setMessage(`Error updating profile: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-transparent">
        Settings
      </h1>

      {message && (
        <div
          className={`p-4 mb-6 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {message}
        </div>
      )}

      {!user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Sign in to your account to manage your settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Sign up for a new account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization
                  </label>
                  <input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
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
                  <p className="mt-1">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="mt-1 text-sm text-gray-700">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Sign In</p>
                  <p className="mt-1">{new Date(user.last_sign_in_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end mb-4">
              <Button variant="destructive" onClick={handleSignOut}>
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
      )}
    </div>
  );
}
